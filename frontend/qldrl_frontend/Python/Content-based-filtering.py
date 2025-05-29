import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Thiết lập logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Stop words tiếng Việt mở rộng
STOP_WORDS_VIETNAMESE = [
    'và', 'của', 'tại', 'cho', 'là', 'được', 'trong', 'với', 'các', 'để',
    'một', 'như', 'này', 'khi', 'đã', 'có', 'từ', 'hay', 'bằng', 'thì',
    'về', 'theo', 'sau', 'trước', 'giữa', 'ngoài', 'trong', 'nếu', 'mà',
    'hoặc', 'nhưng', 'vì', 'do', 'bởi', 'qua', 'lên', 'xuống', 'ra', 'vào'
]

class DatabaseManager:
    """Quản lý kết nối và truy vấn database"""
    
    def __init__(self):
        self.conn_str = 'mssql+pyodbc://@DESKTOP-I1S5SR8/QL_DRL?driver=SQL+Server&trusted_connection=yes'
        self.engine = None
    
    def get_connection(self):
        """Tạo kết nối database"""
        try:
            if self.engine is None:
                self.engine = create_engine(
                    self.conn_str,
                    pool_pre_ping=True,
                    pool_recycle=3600,
                    echo=False
                )
            logger.info("Kết nối CSDL thành công")
            return self.engine
        except Exception as e:
            logger.error(f"Lỗi kết nối CSDL: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi kết nối database: {str(e)}")
    
    def execute_query(self, query: str, params: Dict = None) -> pd.DataFrame:
        """Thực thi truy vấn an toàn"""
        engine = self.get_connection()
        try:
            if params:
                result = pd.read_sql(text(query), engine, params=params)
            else:
                result = pd.read_sql(text(query), engine)
            return result
        except Exception as e:
            logger.error(f"Lỗi thực thi truy vấn: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi truy vấn database: {str(e)}")
        finally:
            if engine:
                engine.dispose()

class DataProcessor:
    """Xử lý và chuẩn hóa dữ liệu"""
    
    @staticmethod
    def clean_activity_name(name: str) -> str:
        """Chuẩn hóa tên hoạt động"""
        if pd.isna(name):
            return ""
        # Loại bỏ thông tin ngày trong ngoặc
        cleaned = re.sub(r'\s*$$Ngày \d+$$', '', str(name))
        # Loại bỏ ký tự đặc biệt và chuẩn hóa
        cleaned = re.sub(r'[^\w\s]', ' ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned.lower()
    
    @staticmethod
    def create_combined_features(df: pd.DataFrame) -> pd.DataFrame:
        """Tạo features kết hợp cho TF-IDF"""
        df = df.copy()
        df['TenHoatDongClean'] = df['TenHoatDong'].apply(DataProcessor.clean_activity_name)
        df['MoTaClean'] = df['MoTa'].fillna('').apply(lambda x: str(x).lower())
        df['LoaiHoatDongClean'] = df['LoaiHoatDong'].fillna('').apply(lambda x: str(x).lower())
        
        # Tăng trọng số cho loại hoạt động
        df['combined_features'] = (
            df['TenHoatDongClean'] + ' ' +
            df['MoTaClean'] + ' ' +
            (df['LoaiHoatDongClean'] + ' ') * 3  # Tăng trọng số loại hoạt động
        )
        return df
    
    @staticmethod
    def calculate_activity_weights(dangky_df: pd.DataFrame, ma_sinh_vien: str) -> List[float]:
        """Tính trọng số cho các hoạt động đã đăng ký"""
        user_registrations = dangky_df[dangky_df['MaSV'] == ma_sinh_vien]
        weights = []
        
        for _, row in user_registrations.iterrows():
            weight = 1.0
            
            # Tăng trọng số cho hoạt động gần đây
            if pd.notnull(row['NgayThamGia']):
                try:
                    days_ago = (datetime.now() - pd.to_datetime(row['NgayThamGia'])).days
                    if days_ago <= 30:
                        weight *= 1.5
                    elif days_ago <= 90:
                        weight *= 1.2
                except:
                    pass
            
            weights.append(weight)
        
        return weights if weights else [1.0]

class RecommendationEngine:
    """Engine gợi ý hoạt động"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.data_processor = DataProcessor()
        self.tfidf_vectorizer = None
    
    def load_data(self, ma_sinh_vien: Optional[str] = None) -> tuple:
        """Tải dữ liệu từ database"""
        try:
            # Lấy hoạt động đang mở
            query_hoatdong = """
            SELECT MaHoatDong, TenHoatDong, MoTa, LoaiHoatDong, 
                   CAST(NgayDienRa AS INT) AS NgayDienRa, 
                   ISNULL(SoLuongDaDangKy, 0) AS SoLuongDaDangKy
            FROM HoatDong
            WHERE TrangThai = N'Đang mở đăng ký'
            """
            hoatdong_df = self.db_manager.execute_query(query_hoatdong)
            
            if hoatdong_df.empty:
                logger.warning("Không có hoạt động đang mở")
                return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
            
            logger.info(f"Tải được {len(hoatdong_df)} hoạt động đang mở")
            
            # Lấy đăng ký của sinh viên
            if ma_sinh_vien:
                query_dangky = """
                SELECT MaSV, MaHoatDong, TrangThai, NgayThamGia
                FROM DangKyHoatDong
                WHERE TrangThai = N'Đăng ký thành công' AND MaSV = :ma_sinh_vien
                """
                dangky_df = self.db_manager.execute_query(query_dangky, {'ma_sinh_vien': ma_sinh_vien})
            else:
                query_dangky = """
                SELECT MaSV, MaHoatDong, TrangThai, NgayThamGia
                FROM DangKyHoatDong
                WHERE TrangThai = N'Đăng ký thành công'
                """
                dangky_df = self.db_manager.execute_query(query_dangky)
            
            logger.info(f"Tải được {len(dangky_df)} đăng ký")
            
            # Lấy chi tiết hoạt động đã đăng ký
            hoatdong_registered_df = pd.DataFrame()
            if not dangky_df.empty and ma_sinh_vien:
                ma_hoat_dong_list = dangky_df['MaHoatDong'].unique().tolist()
                if ma_hoat_dong_list:
                    placeholders = ','.join([f':ma{i}' for i in range(len(ma_hoat_dong_list))])
                    params = {f'ma{i}': ma for i, ma in enumerate(ma_hoat_dong_list)}
                    
                    query_hoatdong_registered = f"""
                    SELECT MaHoatDong, TenHoatDong, MoTa, LoaiHoatDong, 
                           CAST(NgayDienRa AS INT) AS NgayDienRa
                    FROM HoatDong
                    WHERE MaHoatDong IN ({placeholders})
                    """
                    hoatdong_registered_df = self.db_manager.execute_query(query_hoatdong_registered, params)
                    logger.info(f"Tải được {len(hoatdong_registered_df)} hoạt động đã đăng ký")
            
            return hoatdong_df, dangky_df, hoatdong_registered_df
            
        except Exception as e:
            logger.error(f"Lỗi tải dữ liệu: {e}")
            raise
    
    def get_default_recommendations(self, hoatdong_df: pd.DataFrame, top_n: int = 5) -> List[Dict]:
        """Gợi ý mặc định cho sinh viên chưa có lịch sử"""
        try:
            # Lấy tất cả các hoạt động và sắp xếp theo số lượng đăng ký
            sorted_by_registration = hoatdong_df.nlargest(len(hoatdong_df), 'SoLuongDaDangKy')
            
            # Lấy top N hoạt động dựa trên số lượng đăng ký
            recommendations_by_registration = sorted_by_registration.head(top_n)[
                ['MaHoatDong', 'TenHoatDong', 'LoaiHoatDong', 'NgayDienRa']
            ].to_dict('records')
            
            if len(recommendations_by_registration) >= top_n:
                logger.info(f"Tạo {len(recommendations_by_registration)} gợi ý mặc định dựa trên số lượng đăng ký")
                return recommendations_by_registration
            
            # Nếu không đủ top_n hoạt động dựa trên số lượng đăng ký, ưu tiên loại có nhiều hoạt động hơn
            if hoatdong_df.empty:
                logger.warning("Không có hoạt động nào để gợi ý")
                return []
            
            # Đếm số lượng hoạt động theo loại
            activity_counts = hoatdong_df['LoaiHoatDong'].value_counts()
            if activity_counts.empty:
                logger.warning("Không có loại hoạt động nào để đếm")
                return recommendations_by_registration
            
            # Lấy loại có số lượng hoạt động nhiều nhất
            most_common_type = activity_counts.idxmax()
            most_common_activities = hoatdong_df[hoatdong_df['LoaiHoatDong'] == most_common_type]
            
            # Sắp xếp theo số lượng đăng ký trong loại phổ biến nhất và lấy đủ top_n
            additional_recommendations = most_common_activities.nlargest(
                top_n - len(recommendations_by_registration), 'SoLuongDaDangKy'
            )[['MaHoatDong', 'TenHoatDong', 'LoaiHoatDong', 'NgayDienRa']].to_dict('records')
            
            # Kết hợp gợi ý từ số lượng đăng ký và loại phổ biến
            final_recommendations = recommendations_by_registration + additional_recommendations
            final_recommendations = final_recommendations[:top_n]  # Cắt lại để đảm bảo đúng top_n
            
            logger.info(f"Tạo {len(final_recommendations)} gợi ý mặc định (kết hợp số lượng đăng ký và loại phổ biến)")
            return final_recommendations
            
        except Exception as e:
            logger.error(f"Lỗi tạo gợi ý mặc định: {e}")
            return []
    
    def calculate_similarity_scores(self, hoatdong_df: pd.DataFrame, 
                                  hoatdong_registered_df: pd.DataFrame,
                                  dangky_df: pd.DataFrame, ma_sinh_vien: str) -> np.ndarray:
        """Tính điểm tương đồng"""
        try:
            # Chuẩn hóa dữ liệu
            hoatdong_processed = self.data_processor.create_combined_features(hoatdong_df)
            hoatdong_registered_processed = self.data_processor.create_combined_features(hoatdong_registered_df)
            
            # Khởi tạo TF-IDF
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words=STOP_WORDS_VIETNAMESE,
                min_df=1,
                max_df=0.95,
                ngram_range=(1, 2),
                max_features=1000
            )
            
            # Vector hóa tất cả hoạt động
            all_features = pd.concat([
                hoatdong_processed['combined_features'],
                hoatdong_registered_processed['combined_features']
            ], ignore_index=True)
            
            self.tfidf_vectorizer.fit(all_features)
            
            # Vector hóa riêng biệt
            tfidf_matrix = self.tfidf_vectorizer.transform(hoatdong_processed['combined_features'])
            tfidf_matrix_registered = self.tfidf_vectorizer.transform(hoatdong_registered_processed['combined_features'])
            
            # Tính cosine similarity
            cosine_sim = cosine_similarity(tfidf_matrix_registered, tfidf_matrix)
            
            # Tính trọng số
            weights = self.data_processor.calculate_activity_weights(dangky_df, ma_sinh_vien)
            
            # Tính điểm trung bình có trọng số
            if len(weights) == cosine_sim.shape[0]:
                sim_scores = np.average(cosine_sim, axis=0, weights=weights)
            else:
                sim_scores = np.mean(cosine_sim, axis=0)
            
            # Bonus cho hoạt động nhiều ngày
            multi_day_bonus = hoatdong_df['NgayDienRa'] > 1
            sim_scores[multi_day_bonus] *= 1.1
            
            logger.info(f"Tính toán similarity scores thành công")
            return sim_scores
            
        except Exception as e:
            logger.error(f"Lỗi tính similarity scores: {e}")
            return np.array([])
    
    def recommend_activities(self, ma_sinh_vien: str, top_n: int = 5) -> Dict[str, Any]:
        """Gợi ý hoạt động chính"""
        try:
            logger.info(f"Bắt đầu gợi ý cho sinh viên: {ma_sinh_vien}")
            
            # Tải dữ liệu
            hoatdong_df, dangky_df, hoatdong_registered_df = self.load_data(ma_sinh_vien)
            
            if hoatdong_df.empty:
                return {"error": "Không có hoạt động nào đang mở đăng ký"}
            
            # Lấy danh sách hoạt động đã đăng ký
            registered_activities = dangky_df[dangky_df['MaSV'] == ma_sinh_vien]['MaHoatDong'].tolist()
            
            # Lọc hoạt động chưa đăng ký
            available_activities = hoatdong_df[~hoatdong_df['MaHoatDong'].isin(registered_activities)]
            
            if available_activities.empty:
                return {"error": "Sinh viên đã đăng ký hết các hoạt động đang mở"}
            
            # Nếu chưa có lịch sử đăng ký
            if hoatdong_registered_df.empty:
                logger.info(f"Sinh viên {ma_sinh_vien} chưa có lịch sử đăng ký")
                recommendations = self.get_default_recommendations(available_activities, top_n)
                return {"recommendations": recommendations, "type": "default"}
            
            # Tính similarity scores
            sim_scores = self.calculate_similarity_scores(
                available_activities, hoatdong_registered_df, dangky_df, ma_sinh_vien
            )
            
            if len(sim_scores) == 0:
                recommendations = self.get_default_recommendations(available_activities, top_n)
                return {"recommendations": recommendations, "type": "fallback"}
            
            # Lấy loại hoạt động ưa thích
            preferred_types = hoatdong_registered_df['LoaiHoatDong'].value_counts().index.tolist()
            
            # Lọc theo loại ưa thích
            preferred_activities = available_activities[
                available_activities['LoaiHoatDong'].isin(preferred_types[:3])  # Top 3 loại ưa thích
            ]
            
            if not preferred_activities.empty:
                # Lấy indices của hoạt động ưa thích
                preferred_indices = preferred_activities.index.tolist()
                available_indices = available_activities.index.tolist()
                
                # Map indices
                score_indices = [(available_indices.index(idx), sim_scores[available_indices.index(idx)]) 
                               for idx in preferred_indices if idx in available_indices]
            else:
                # Nếu không có loại ưa thích, lấy tất cả
                score_indices = [(i, score) for i, score in enumerate(sim_scores)]
            
            # Sắp xếp và lấy top N
            score_indices.sort(key=lambda x: x[1], reverse=True)
            top_indices = [available_activities.index.tolist()[i[0]] for i in score_indices[:top_n]]
            
            recommendations = hoatdong_df.loc[top_indices][
                ['MaHoatDong', 'TenHoatDong', 'LoaiHoatDong', 'NgayDienRa']
            ].to_dict('records')
            
            logger.info(f"Gợi ý thành công {len(recommendations)} hoạt động cho {ma_sinh_vien}")
            return {"recommendations": recommendations, "type": "personalized"}
            
        except Exception as e:
            logger.error(f"Lỗi trong quá trình gợi ý: {e}")
            return {"error": f"Lỗi hệ thống: {str(e)}"}

# FastAPI Application
app = FastAPI(
    title="Hệ thống gợi ý hoạt động",
    description="API gợi ý hoạt động cho sinh viên dựa trên content-based filtering",
    version="1.0.0"
)

recommendation_engine = RecommendationEngine()

class RecommendationRequest(BaseModel):
    ma_sinh_vien: str
    top_n: int = 5
    
    class Config:
        schema_extra = {
            "example": {
                "ma_sinh_vien": "DHTH123478",
                "top_n": 5
            }
        }

class RecommendationResponse(BaseModel):
    recommendations: Optional[List[Dict[str, Any]]] = None
    type: Optional[str] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Hệ thống gợi ý hoạt động đang hoạt động"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest):
    """Endpoint gợi ý hoạt động cho sinh viên"""
    try:
        if not request.ma_sinh_vien.strip():
            raise HTTPException(status_code=400, detail="Mã sinh viên không được để trống")
        
        if request.top_n <= 0 or request.top_n > 20:
            raise HTTPException(status_code=400, detail="top_n phải từ 1 đến 20")
        
        result = recommendation_engine.recommend_activities(request.ma_sinh_vien, request.top_n)
        return RecommendationResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lỗi không mong muốn: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống không mong muốn")

# Test function
def test_recommendation_system():
    """Hàm test hệ thống"""
    try:
        print("=== KIỂM TRA HỆ THỐNG GỢI Ý ===")
        
        engine = RecommendationEngine()
        test_student = "DHTH387104"
        
        print(f"\nKiểm tra gợi ý cho sinh viên: {test_student}")
        result = engine.recommend_activities(test_student, top_n=5)
        
        if "error" in result:
            print(f"Lỗi: {result['error']}")
        else:
            print(f"\nLoại gợi ý: {result.get('type', 'unknown')}")
            print(f"Số lượng gợi ý: {len(result['recommendations'])}")
            print("\nDanh sách gợi ý:")
            for i, rec in enumerate(result['recommendations'], 1):
                print(f"{i}. {rec['TenHoatDong']}")
                print(f"   Loại: {rec['LoaiHoatDong']}")
                print(f"   Số ngày: {rec['NgayDienRa']}")
                print()
        
        print("=== KIỂM TRA HOÀN THÀNH ===")
        
    except Exception as e:
        print(f"Lỗi trong quá trình test: {e}")

# Main execution
if __name__ == "__main__":
    import uvicorn
    
    # Chạy test trước
    test_recommendation_system()
    
    # Khởi động server
    print("\n=== KHỞI ĐỘNG SERVER ===")
    print("Server sẽ chạy tại: http://localhost:5555")
    print("API docs tại: http://localhost:5555/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=5555,
        reload=False,
        log_level="info"
    )