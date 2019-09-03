docker build --tag live-share-can .
docker tag live-share-can vslsCommunitiesRegistry.azurecr.io/vsls-contrib/live-share-can:v0.2.0
docker push vslsCommunitiesRegistry.azurecr.io/vsls-contrib/live-share-can:v0.2.0
