docker build --tag live-share-can .
docker tag live-share-can vslsCommunitiesRegistry.azurecr.io/live-share-can:v0.1.0
docker push vslsCommunitiesRegistry.azurecr.io/live-share-can:v0.1.0
az webapp restart --resource-group vslsCommunitiesResourceGroup --name vslsCommunitiesWebApp
