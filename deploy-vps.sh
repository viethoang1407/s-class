#!/bin/bash
# ==========================================================
# Script tự động cài đặt và triển khai S-Class Microservices trên VPS Ubuntu
# Chạy script bằng quyền sudo: sudo bash deploy-vps.sh
# ==========================================================

# Định dạng màu cho output
GREEN='\033[0;32m'
NC='\033[0;6m' # No Color
YELLOW='\033[1;33m'
RED='\033[0;31m'

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}🚀 Bắt đầu cài đặt S-Class Microservices trên VPS Ubuntu...${NC}"
echo -e "${GREEN}==========================================================${NC}"

# 1. Cập nhật hệ thống
echo -e "${YELLOW}[1/4] Cập nhật danh sách gói hệ thống...${NC}"
sudo apt-get update -y

# 2. Cài đặt Docker (nếu chưa có)
echo -e "${YELLOW}[2/4] Kiểm tra và cài đặt Docker...${NC}"
if ! [ -x "$(command -v docker)" ]; then
    echo "Đang cài đặt Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    # Hỗ trợ cả kiến trúc chip x86_64 và ARM64 (cho Oracle Cloud)
    ARCH=$(dpkg --print-architecture)
    sudo add-apt-repository "deb [arch=$ARCH] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
    sudo apt-get update -y
    sudo apt-get install -y docker-ce
    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}✓ Cài đặt Docker thành công!${NC}"
else
    echo -e "${GREEN}✓ Docker đã được cài đặt từ trước.${NC}"
fi

# 3. Cài đặt Docker Compose (nếu chưa có)
echo -e "${YELLOW}[3/4] Kiểm tra và cài đặt Docker Compose...${NC}"
if ! [ -x "$(command -v docker-compose)" ]; then
    echo "Đang cài đặt Docker Compose..."
    sudo apt-get install -y docker-compose
    echo -e "${GREEN}✓ Cài đặt Docker Compose thành công!${NC}"
else
    echo -e "${GREEN}✓ Docker Compose đã được cài đặt từ trước.${NC}"
fi

# 4. Kiểm tra cấu hình .env
echo -e "${YELLOW}[4/4] Kiểm tra cấu hình môi trường (.env)...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ Không tìm thấy file .env trong thư mục gốc!${NC}"
    echo "Vui lòng tạo file .env trước khi tiếp tục."
    exit 1
else
    echo -e "${GREEN}✓ Đã tìm thấy file .env cấu hình.${NC}"
fi

# 5. Khởi chạy hệ thống Container
echo -e "${YELLOW}🤖 Đang tiến hành build và khởi chạy các service bằng Docker Compose...${NC}"
sudo docker-compose up -d --build

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}🎉 QUÁ TRÌNH TRIỂN KHAI HOÀN TẤT!${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo -e "Hệ thống các dịch vụ đang chạy ngầm trên VPS của bạn."
echo -e "Bạn có thể kiểm tra trạng thái các service bằng lệnh: ${YELLOW}sudo docker ps${NC}"
echo -e "Theo dõi log thời gian thực: ${YELLOW}sudo docker-compose logs -f${NC}"
echo -e "${GREEN}==========================================================${NC}"
