build:
	docker build -t rss-parser:latest .
run:
	docker run -d --name rss-parser -v ./.env:/program/.env -v ./links.txt:/program/links.txt -v ./cache.json:/program/cache.json rss-parser:latest
rm:
	docker rm -f rss-parser
rmi: 
	docker rmi -f rss-parser