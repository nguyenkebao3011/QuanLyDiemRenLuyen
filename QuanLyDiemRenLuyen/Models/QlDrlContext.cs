using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QuanLyDiemRenLuyen.Models;

public partial class QlDrlContext : DbContext
{
    public QlDrlContext()
    {
    }

    public QlDrlContext(DbContextOptions<QlDrlContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChiTietThongBao> ChiTietThongBaos { get; set; }

    public virtual DbSet<DangKyHoatDong> DangKyHoatDongs { get; set; }

    public virtual DbSet<DiemDanhHoatDong> DiemDanhHoatDongs { get; set; }

    public virtual DbSet<DiemRenLuyen> DiemRenLuyens { get; set; }

    public virtual DbSet<GiaoVien> GiaoViens { get; set; }

    public virtual DbSet<HoatDong> HoatDongs { get; set; }

    public virtual DbSet<HocKy> HocKies { get; set; }

    public virtual DbSet<HoiDongChamDiem> HoiDongChamDiems { get; set; }

    public virtual DbSet<Lop> Lops { get; set; }

    public virtual DbSet<MinhChungHoatDong> MinhChungHoatDongs { get; set; }

    public virtual DbSet<PhanHoiDiemRenLuyen> PhanHoiDiemRenLuyens { get; set; }

    public virtual DbSet<QuanLyKhoa> QuanLyKhoas { get; set; }

    public virtual DbSet<SinhVien> SinhViens { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<ThanhVienHoiDong> ThanhVienHoiDongs { get; set; }

    public virtual DbSet<ThongBao> ThongBaos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

        => optionsBuilder.UseSqlServer("Server=DESKTOP-N9TFSHP\\SQL2022;Database=QL_DRL;User Id=sa;Password=123;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChiTietThongBao>(entity =>
        {
            entity.HasKey(e => e.MaChiTietThongBao).HasName("PK__ChiTietT__90595373BD34D8E6");

            entity.ToTable("ChiTietThongBao");

            entity.Property(e => e.MaSv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaSV");
            entity.Property(e => e.NgayDoc).HasColumnType("datetime");

            entity.HasOne(d => d.MaSvNavigation).WithMany(p => p.ChiTietThongBaos)
                .HasForeignKey(d => d.MaSv)
                .HasConstraintName("FK_ChiTietThongBao_SinhVien");

            entity.HasOne(d => d.MaThongBaoNavigation).WithMany(p => p.ChiTietThongBaos)
                .HasForeignKey(d => d.MaThongBao)
                .HasConstraintName("FK_ChiTietThongBao_ThongBao");
        });

        modelBuilder.Entity<DangKyHoatDong>(entity =>
        {
            entity.HasKey(e => e.MaDangKy).HasName("PK__DangKyHo__BA90F02DD63F0718");

            entity.ToTable("DangKyHoatDong");

            entity.Property(e => e.MaSv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaSV");
            entity.Property(e => e.NgayDangKy).HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaHoatDongNavigation).WithMany(p => p.DangKyHoatDongs)
                .HasForeignKey(d => d.MaHoatDong)
                .HasConstraintName("FK_DangKyHoatDong_HoatDong");

            entity.HasOne(d => d.MaSvNavigation).WithMany(p => p.DangKyHoatDongs)
                .HasForeignKey(d => d.MaSv)
                .HasConstraintName("FK_DangKyHoatDong_SinhVien");
        });

        modelBuilder.Entity<DiemDanhHoatDong>(entity =>
        {
            entity.HasKey(e => e.MaDiemDanh).HasName("PK__DiemDanh__1512439DEABB09DF");

            entity.ToTable("DiemDanhHoatDong");

            entity.Property(e => e.GhiChu).HasMaxLength(255);
            entity.Property(e => e.MaQl)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaQL");
            entity.Property(e => e.ThoiGianDiemDanh).HasColumnType("datetime");

            entity.HasOne(d => d.MaDangKyNavigation).WithMany(p => p.DiemDanhHoatDongs)
                .HasForeignKey(d => d.MaDangKy)
                .HasConstraintName("FK_DiemDanhHoatDong_DangKy");

            entity.HasOne(d => d.MaQlNavigation).WithMany(p => p.DiemDanhHoatDongs)
                .HasForeignKey(d => d.MaQl)
                .HasConstraintName("FK_DiemDanhHoatDong_QuanLy");
        });

        modelBuilder.Entity<DiemRenLuyen>(entity =>
        {
            entity.HasKey(e => e.MaDiemRenLuyen).HasName("PK__DiemRenL__B6F7868DB281515C");

            entity.ToTable("DiemRenLuyen");

            entity.Property(e => e.MaSv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaSV");
            entity.Property(e => e.NgayChot).HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.Property(e => e.XepLoai).HasMaxLength(50);

            entity.HasOne(d => d.MaHocKyNavigation).WithMany(p => p.DiemRenLuyens)
                .HasForeignKey(d => d.MaHocKy)
                .HasConstraintName("FK_DiemRenLuyen_HocKy");

            entity.HasOne(d => d.MaSvNavigation).WithMany(p => p.DiemRenLuyens)
                .HasForeignKey(d => d.MaSv)
                .HasConstraintName("FK_DiemRenLuyen_SinhVien");
        });

        modelBuilder.Entity<GiaoVien>(entity =>
        {
            entity.HasKey(e => e.MaGv).HasName("PK__GiaoVien__2725AEF381706822");

            entity.ToTable("GiaoVien");

            entity.HasIndex(e => e.MaTaiKhoan, "UQ__GiaoVien__AD7C6528EAC86CE1").IsUnique();

            entity.Property(e => e.MaGv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaGV");
            entity.Property(e => e.AnhDaiDien)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DiaChi)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.GioiTinh).HasMaxLength(10);
            entity.Property(e => e.HoTen).HasMaxLength(50);
            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.MaTaiKhoanNavigation).WithOne(p => p.GiaoVien)
                .HasForeignKey<GiaoVien>(d => d.MaTaiKhoan)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GiaoVien_TaiKhoan");
        });

        modelBuilder.Entity<HoatDong>(entity =>
        {
            entity.HasKey(e => e.MaHoatDong).HasName("PK__HoatDong__BD808BE701E2C148");

            entity.ToTable("HoatDong");

            entity.Property(e => e.DiaDiem).HasMaxLength(200);
            entity.Property(e => e.MaQl)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaQL");
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.NgayBatDau).HasColumnType("datetime");
            entity.Property(e => e.NgayKetThuc).HasColumnType("datetime");
            entity.Property(e => e.NgayTao).HasColumnType("datetime");
            entity.Property(e => e.TenHoatDong).HasMaxLength(255);
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaHocKyNavigation).WithMany(p => p.HoatDongs)
                .HasForeignKey(d => d.MaHocKy)
                .HasConstraintName("FK_HoatDong_HocKy");

            entity.HasOne(d => d.MaQlNavigation).WithMany(p => p.HoatDongs)
                .HasForeignKey(d => d.MaQl)
                .HasConstraintName("FK_HoatDong_QuanLyKhoa");
        });

        modelBuilder.Entity<HocKy>(entity =>
        {
            entity.HasKey(e => e.MaHocKy).HasName("PK__HocKy__1EB55110E4F98367");

            entity.ToTable("HocKy");

            entity.Property(e => e.NamHoc)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TenHocKy).HasMaxLength(50);
        });

        modelBuilder.Entity<HoiDongChamDiem>(entity =>
        {
            entity.HasKey(e => e.MaHoiDong).HasName("PK__HoiDongC__998808B350E9103D");

            entity.ToTable("HoiDongChamDiem");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.TenHoiDong).HasMaxLength(255);

            entity.HasOne(d => d.MaHocKyNavigation).WithMany(p => p.HoiDongChamDiems)
                .HasForeignKey(d => d.MaHocKy)
                .HasConstraintName("FK_HoiDongChamDiem_HocKy");
        });

        modelBuilder.Entity<Lop>(entity =>
        {
            entity.HasKey(e => e.MaLop).HasName("PK__Lop__3B98D273BB295964");

            entity.ToTable("Lop");

            entity.Property(e => e.MaLop)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MaGv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaGV");
            entity.Property(e => e.NienKhoa)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TenLop).HasMaxLength(100);

            entity.HasOne(d => d.MaGvNavigation).WithMany(p => p.Lops)
                .HasForeignKey(d => d.MaGv)
                .HasConstraintName("FK_Lop_GiaoVien");
        });

        modelBuilder.Entity<MinhChungHoatDong>(entity =>
        {
            entity.HasKey(e => e.MaMinhChung).HasName("PK__MinhChun__AEBAC7476BA3F970");

            entity.ToTable("MinhChungHoatDong");

            entity.Property(e => e.DuongDanFile)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.MoTa).HasMaxLength(255);
            entity.Property(e => e.NgayTao).HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaDangKyNavigation).WithMany(p => p.MinhChungHoatDongs)
                .HasForeignKey(d => d.MaDangKy)
                .HasConstraintName("FK_MinhChungHoatDong_DangKy");
        });

        modelBuilder.Entity<PhanHoiDiemRenLuyen>(entity =>
        {
            entity.HasKey(e => e.MaPhanHoi).HasName("PK__PhanHoiD__3458D20F6AC24566");

            entity.ToTable("PhanHoiDiemRenLuyen");

            entity.Property(e => e.MaQl)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaQL");
            entity.Property(e => e.NgayPhanHoi).HasColumnType("datetime");
            entity.Property(e => e.NgayXuLy).HasColumnType("datetime");
            entity.Property(e => e.NoiDungPhanHoi).HasMaxLength(500);
            entity.Property(e => e.NoiDungXuLy).HasMaxLength(500);
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaDiemRenLuyenNavigation).WithMany(p => p.PhanHoiDiemRenLuyens)
                .HasForeignKey(d => d.MaDiemRenLuyen)
                .HasConstraintName("FK_PhanHoi_DiemRenLuyen");

            entity.HasOne(d => d.MaMinhChungNavigation).WithMany(p => p.PhanHoiDiemRenLuyens)
                .HasForeignKey(d => d.MaMinhChung)
                .HasConstraintName("FK_PhanHoi_MinhChung");

            entity.HasOne(d => d.MaQlNavigation).WithMany(p => p.PhanHoiDiemRenLuyens)
                .HasForeignKey(d => d.MaQl)
                .HasConstraintName("FK_PhanHoi_QuanLy");
        });

        modelBuilder.Entity<QuanLyKhoa>(entity =>
        {
            entity.HasKey(e => e.MaQl).HasName("PK__QuanLyKh__2725F852EDF3A01A");

            entity.ToTable("QuanLyKhoa");

            entity.HasIndex(e => e.MaTaiKhoan, "UQ__QuanLyKh__AD7C6528DEE49FC6").IsUnique();

            entity.Property(e => e.MaQl)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaQL");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.HoTen).HasMaxLength(50);
            entity.Property(e => e.Khoa)
                .HasMaxLength(50)
                .HasDefaultValue("KHOA CNTT");
            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.MaTaiKhoanNavigation).WithOne(p => p.QuanLyKhoa)
                .HasForeignKey<QuanLyKhoa>(d => d.MaTaiKhoan)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuanLyKhoa_TaiKhoan");
        });

        modelBuilder.Entity<SinhVien>(entity =>
        {
            entity.HasKey(e => e.MaSV).HasName("PK__SinhVien__2725081A941C2C52");

            entity.ToTable("SinhVien");

            entity.HasIndex(e => e.MaTaiKhoan, "UQ__SinhVien__AD7C65289F15D864").IsUnique();

            entity.Property(e => e.MaSV)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaSV");
            entity.Property(e => e.AnhDaiDien)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DiaChi)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.GioiTinh).HasMaxLength(10);
            entity.Property(e => e.HoTen).HasMaxLength(50);
            entity.Property(e => e.MaLop)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.MaLopNavigation).WithMany(p => p.SinhViens)
                .HasForeignKey(d => d.MaLop)
                .HasConstraintName("FK_SinhVien_Lop");

            entity.HasOne(d => d.MaTaiKhoanNavigation).WithOne(p => p.SinhVien)
                .HasForeignKey<SinhVien>(d => d.MaTaiKhoan)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SinhVien_TaiKhoan");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.MaTaiKhoan).HasName("PK__TaiKhoan__AD7C65290A72ECCE");

            entity.ToTable("TaiKhoan");

            entity.HasIndex(e => e.TenDangNhap, "UQ__TaiKhoan__55F68FC063BB54BC").IsUnique();

            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MatKhau)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TenDangNhap)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.VaiTro)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ThanhVienHoiDong>(entity =>
        {
            entity.HasKey(e => e.MaThanhVien).HasName("PK__ThanhVie__2BE0A0F008DE2E82");

            entity.ToTable("ThanhVienHoiDong");

            entity.Property(e => e.MaGv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaGV");
            entity.Property(e => e.VaiTroTrongHoiDong).HasMaxLength(100);

            entity.HasOne(d => d.MaGvNavigation).WithMany(p => p.ThanhVienHoiDongs)
                .HasForeignKey(d => d.MaGv)
                .HasConstraintName("FK_ThanhVienHoiDong_GiaoVien");

            entity.HasOne(d => d.MaHoiDongNavigation).WithMany(p => p.ThanhVienHoiDongs)
                .HasForeignKey(d => d.MaHoiDong)
                .HasConstraintName("FK_ThanhVienHoiDong_HoiDong");
        });

        modelBuilder.Entity<ThongBao>(entity =>
        {
            entity.HasKey(e => e.MaThongBao).HasName("PK__ThongBao__04DEB54E5002E3F2");

            entity.ToTable("ThongBao");

            entity.Property(e => e.LoaiThongBao).HasMaxLength(50);
            entity.Property(e => e.MaQl)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaQL");
            entity.Property(e => e.NgayTao).HasColumnType("datetime");
            entity.Property(e => e.TieuDe).HasMaxLength(255);
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaQlNavigation).WithMany(p => p.ThongBaos)
                .HasForeignKey(d => d.MaQl)
                .HasConstraintName("FK_ThongBao_QuanLy");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
