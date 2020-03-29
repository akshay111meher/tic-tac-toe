docker-compose down --remove-orphans

docker build -t tic .

docker rmi -f `docker images -f "dangling=true" -q`
docker-compose up -d
