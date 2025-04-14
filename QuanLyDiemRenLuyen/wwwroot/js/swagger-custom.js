// wwwroot/js/swagger-custom.js
(function () {
    const swaggerUIBundle = SwaggerUIBundle;

    const CustomPlugin = () => {
        return {
            statePlugins: {
                spec: {
                    wrapSelectors: {
                        afterRender: (ori, system) => (ui, render) => {
                            setTimeout(() => {
                                const operation = ui.getOperation('PUT', '/api/SinhVien/update-profile');
                                if (operation) {
                                    const token = ui.auth.get('securityDefinition_Bearer')?.token;
                                    if (token) {
                                        fetch('http://localhost:5163/api/SinhViens/Lay_sinhvien_theo_vaitro', {
                                            headers: {
                                                Authorization: `Bearer ${token}`
                                            }
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                const sinhVien = data;
                                                if (sinhVien) {
                                                    const form = operation.querySelector('.try-out__form');
                                                    if (form) {
                                                        const inputs = form.querySelectorAll('input');
                                                        inputs.forEach(input => {
                                                            const paramName = input.getAttribute('name');
                                                            if (paramName === 'MaSV') input.value = sinhVien.MaSV || '';
                                                            if (paramName === 'HoTen') input.value = sinhVien.HoTen || '';
                                                            if (paramName === 'MaLop') input.value = sinhVien.MaLop || '';
                                                            if (paramName === 'Email') input.value = sinhVien.Email || '';
                                                            if (paramName === 'SoDienThoai') input.value = sinhVien.SoDienThoai || '';
                                                            if (paramName === 'DiaChi') input.value = sinhVien.DiaChi || '';
                                                            if (paramName === 'NgaySinh') input.value = sinhVien.NgaySinh || '';
                                                            if (paramName === 'GioiTinh') input.value = sinhVien.GioiTinh || '';
                                                            if (paramName === 'MaVaiTro') input.value = sinhVien.MaVaiTro || 0;
                                                            if (paramName === 'TrangThai') input.value = sinhVien.TrangThai || '';
                                                        });
                                                    }
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Lỗi khi lấy thông tin sinh viên:', error);
                                            });
                                    }
                                }
                            }, 1000);
                            return ori(ui, render);
                        }
                    }
                }
            }
        };
    };

    window.onload = function () {
        const ui = swaggerUIBundle({
            url: '/swagger/v1/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                swaggerUIBundle.presets.apis,
                swaggerUIBundle.SwaggerUIBundle
            ],
            plugins: [
                swaggerUIBundle.plugins.DownloadUrl,
                CustomPlugin
            ]
        });

        window.ui = ui;
    };
})();