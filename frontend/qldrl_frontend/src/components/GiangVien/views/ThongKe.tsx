// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';

// const ThongKeComponent = () => {
//   const [lopOptions, setLopOptions] = useState([]);
//   const [hocKyOptions, setHocKyOptions] = useState([]);
//   const [selectedLop, setSelectedLop] = useState('');
//   const [selectedHocKy, setSelectedHocKy] = useState('');
//   const [thongKeData, setThongKeData] = useState([]);
//   const [chiTietData, setChiTietData] = useState([]);

//   // Lấy danh sách lớp và học kỳ
//   useEffect(() => {
//     axios.get('http://localhost:5163/api/Lop/lay_danh_sach_lop')
//       .then(res => setLopOptions(res.data))
//       .catch(err => console.error('Lỗi lấy lớp:', err));

//     axios.get('http://localhost:5163/api/HocKy/lay_hoc_ky')
//       .then(res => setHocKyOptions(res.data))
//       .catch(err => console.error('Lỗi lấy học kỳ:', err));
//   }, []);

//   // Xử lý thay đổi lớp
//   const handleLopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedLop(e.target.value);
//   };

//   // Xử lý thay đổi học kỳ
//   const handleHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedHocKy(e.target.value);
//   };

//   // Xử lý khi nhấn nút thống kê
//   const handleSubmit = () => {
//     if (!selectedLop || !selectedHocKy) return;

//     axios.get('http://localhost:5163/api/ThongKe/thongke-theo-giang-vien', {
//       params: {
//         hocKy: selectedHocKy,
//         maLop: selectedLop
//       }
//     })
//     .then(res => {
//       setThongKeData(res.data);
//     })
//     .catch(err => console.error('Lỗi thống kê:', err));
//     // axios.get(`http://localhost:3000/api/chitiet/${selectedLop}/${selectedHocKy}`)
//     //   .then(res => {
//     //     setChiTietData(res.data);
//     //   })
//     //   .catch(err => console.error('Lỗi chi tiết:', err));
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-2xl font-bold text-center mb-4">Thống kê điểm rèn luyện</h2>

//       <div className="flex flex-col md:flex-row items-center gap-4">
//         <select
//           className="border p-2 rounded w-full md:w-1/3"
//           value={selectedLop}
//           onChange={handleLopChange}
//         >
//           <option value="">Chọn lớp</option>
//           {lopOptions.map((lop: any) => (
//             <option key={lop.MaLop} value={lop.MaLop}>{lop.TenLop}</option>
//           ))}
//         </select>

//         <select
//           className="border p-2 rounded w-full md:w-1/3"
//           value={selectedHocKy}
//           onChange={handleHocKyChange}
//         >
//           <option value="">Chọn học kỳ</option>
//           {hocKyOptions.map((hk: any) => (
//             <option key={hk.MaHocKy} value={hk.MaHocKy}>{hk.TenHocKy}</option>
//           ))}
//         </select>

//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           onClick={handleSubmit}
//         >
//           Thống kê
//         </button>
//       </div>

//       {thongKeData.length > 0 && (
//         <div className="bg-white shadow rounded p-4">
//           <h3 className="text-xl font-semibold mb-2">Biểu đồ thống kê</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={thongKeData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="XepLoai" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="SoLuong" fill="#3182ce" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}

//       {chiTietData.length > 0 && (
//         <div className="bg-white shadow rounded p-4 overflow-x-auto">
//           <h3 className="text-xl font-semibold mb-2">Chi tiết thống kê</h3>
//           <table className="table-auto w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-left">
//                 <th className="p-2 border">Mã sinh viên</th>
//                 <th className="p-2 border">Tên sinh viên</th>
//                 <th className="p-2 border">Lớp</th>
//                 <th className="p-2 border">Học kỳ</th>
//                 <th className="p-2 border">Tổng điểm</th>
//                 <th className="p-2 border">Xếp loại</th>
//               </tr>
//             </thead>
//             <tbody>
//               {chiTietData.map((row: any, index: number) => (
//                 <tr key={index} className="hover:bg-gray-50">
//                   <td className="p-2 border">{row.MaSinhVien}</td>
//                   <td className="p-2 border">{row.TenSinhVien}</td>
//                   <td className="p-2 border">{row.TenLop}</td>
//                   <td className="p-2 border">{row.TenHocKy}</td>
//                   <td className="p-2 border">{row.TongDiem}</td>
//                   <td className="p-2 border">{row.XepLoai}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ThongKeComponent;
import React from "react";

export const ThongKe = () => {
  return <div>ThongKe</div>;
};
