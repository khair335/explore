var app = angular.module("app", []);
app.controller("HelloController", function($scope, $http) {

   $http.get("/api/content/path?path=optical/suresh/storage")
    .then(function(response) {
        $scope.product_detail = response.data;
        $scope.message = "Hello, AngularJS";
        if($scope.product_detail.attributes.ProductImage)
            image_content_id = $scope.product_detail.attributes.ProductImage.content_id
            image_content = $scope.product_detail.referenced_contents[image_content_id]
            $scope.image_url = '/'+image_content.attributes.ImageFile.vanity_url;
    });
});