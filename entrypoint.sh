#!/bin/bash
set -e

# Get the maximum upload file size for Nginx, default to 0: unlimited
USE_NGINX_MAX_UPLOAD=${NGINX_MAX_UPLOAD:-0}
# Generate Nginx config for maximum upload file size
echo "client_max_body_size $USE_NGINX_MAX_UPLOAD;" > /etc/nginx/conf.d/upload.conf

# Get the number of workers for Nginx, default to 1
USE_NGINX_WORKER_PROCESSES=${NGINX_WORKER_PROCESSES:-1}
# Modify the number of worker processes in Nginx config
sed -i "/worker_processes\s/c\worker_processes ${USE_NGINX_WORKER_PROCESSES};" /etc/nginx/nginx.conf

# Read username and password from files
username=$(cat /usr/src/app/username.txt)
password=$(cat /usr/src/app/password.txt)

# Export username and password as environment variables
export username
export password

encoded_credentials=$(echo -n "$username:$password" | base64)
# 223744 Re: Broadcom htaccess password rotation "To fetch htaccess credentials from AWS Prameter store"
# Path to your Proxying configuration file
proxying_conf="/etc/nginx/redirects/proxying.conf"
# Update the Authorization header in the NGINX configuration
sed -i "s|proxy_set_header Authorization \"Basic PLACEHOLDER\";|proxy_set_header Authorization \"Basic $encoded_credentials\";|" "$proxying_conf"

# Modify Nignx config for listen port
#sed -i "s/{{envtype}}/$envtype/g" /etc/nginx/conf.d/appserver.conf

# Start nginx
#nginx -c /etc/nginx/nginx.conf -g 'daemon off;'

# Start python
#cd /usr/src/app
#python -um cmsgateway.appserver --path=/tmp/example_%(process_num)s.sock

# Start npm web
#cd /usr/src/app/web
#npm run start:prod -D

#nginx -c /etc/nginx/nginx.conf -g 'daemon off;'

exec "$@"