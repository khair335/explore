#!/bin/bash
realpath robots.txt
realpath proxying.conf
#sed -i 's/Satellite/ContentServer/g' /usr/src/app/robots.txt

echo $env


echo replacing PROXYING_API_DEST

encoded_credentials=$(echo -n "$username:$password" | base64)
# 223744 Re: Broadcom htaccess password rotation "To fetch htaccess credentials from AWS Prameter store"
# Path to your NGINX configuration file
nginx_conf="nginx/nginx.conf"
# Update the Authorization header in the NGINX configuration
sed -i "s|proxy_set_header Authorization \"Basic PLACEHOLDER\";|proxy_set_header Authorization \"Basic $encoded_credentials\";|" "$nginx_conf"

if [ $env = 'dev' ]; then
  sed -i 's/REGION/us-east-1/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/dev/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/dev/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/beta/dev/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/brcm-cs-dev-docs.aws/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts 
  sed -i 's/DOCS-DOMAIN/brcm-cs-dev-docs.aws/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/dev/g' /etc/supervisor/conf.d/supervisord.conf

  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/dev/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/dev-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/REGION/us-east-1/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/dev/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/dev-avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/dev-avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/UI_DEST_HOST/dev-ui.aws/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf

fi
if [ $env = 'qa' ]; then
  sed -i 's/REGION/us-east-1/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/qa/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/qa/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/beta/qa/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts 
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/qa/g' /etc/supervisor/conf.d/supervisord.conf

  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/qa/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/qa-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/REGION/us-east-1/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/qa/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/dev-avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-demo/g' /etc/nginx/redirects/proxying.conf
fi
if [ $env = 'stg' ]; then
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/stage/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/stage/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/beta/stage/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/docscmsstaging/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts 
  sed -i 's/DOCS-DOMAIN/docscmsstaging/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/stage/g' /etc/supervisor/conf.d/supervisord.conf

  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/stg/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/cmsstaging/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/stage/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
fi
if [ $env = 'prd' ]; then
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/prod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts 
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/prod/g' /etc/supervisor/conf.d/supervisord.conf


  sed -i 's/AUTH_DYNAMIC/off' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"off"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/prd/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/prd-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/www/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/prod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
fi
if [ $env = 'dr' ]; then
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/prod/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts 
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/prod/g' /etc/supervisor/conf.d/supervisord.conf

  sed -i 's/AUTH_DYNAMIC/off' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"off"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/dr/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/dr-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/www/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/REGION/us-west-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/prod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf

fi
if [ $env = 'vmdev' ]; then
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmdev/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmdev/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/VM-BUCKET-ENV-/vmdev-/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/vmdev/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/brcm-cs-dev-docs.aws/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts
  sed -i 's/DOCS-DOMAIN/brcm-cs-dev-docs.aws/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/vmdev/g' /etc/supervisor/conf.d/supervisord.conf

  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts

  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts

  sed -i 's/PROXY_API_DEST/vmdev/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/vmdev-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/vmdev-ui.cloud2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/vmdev/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
  #sed -i 's/UI_DEST_HOST/vmdev-ui.aws/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/UI_DEST_HOST/vmdev-ui.cloud2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/vmdocs-proxy.conf
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/vmdocs-proxy.conf

fi
if [ $env = 'vmqa' ]; then
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmqa/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmqa/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/VM-BUCKET-ENV-/vmdev-/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/vmqa/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/vmqa/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts
  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/PROXY_API_DEST/vmqa/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/vmqa-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/vmqa-ui.cloud2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/vmqa/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/dev-broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/DOCSBUCKET/vmdev-avagodocs/g' /etc/nginx/redirects/vmdocs-proxy.conf
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/vmdocs-proxy.conf
fi
if [ $env = 'vmstg' ]; then
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmstage/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmstage/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/VM-BUCKET-ENV-/vm/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/vmstage/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/docscmsstaging/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts
  sed -i 's/DOCS-DOMAIN/docscmsstaging/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/vmstage/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/AUTH_DYNAMIC/Restricted Content' /etc/nginx/vhosts/brcm-cs-ui-vhosts
  sed -i 's/AUTH_DYNAMIC/"Restricted Content"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/PROXY_API_DEST/vmstg/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/vmstg-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/vmstg-ui.cloud2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/vmstage/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/vmdocs-proxy.conf
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/vmdocs-proxy.conf
fi
if [ $env = 'vmprd' ]; then
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmprod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmprod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/VM-BUCKET-ENV-/vm/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/vmprod/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts
  sed -i 's/DOCS-DOMAIN/docs/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/vmprod/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/AUTH_DYNAMIC/off' /etc/nginx/vhosts/brcm-cs-ui-vhosts
  sed -i 's/AUTH_DYNAMIC/"off"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/PROXY_API_DEST/vmprd/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/vmprd-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/vmprd-ui.cloud2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/vmprod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/vmdocs-proxy.conf
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/vmdocs-proxy.conf
fi
if [ $env = 'vmdr' ]; then
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmprod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/BUCKETENV/vmprod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/VM-BUCKET-ENV-/vm/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/beta/vmprod/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-available/brcm-cs-ui-vhosts
  sed -i 's/DOCS-DOMAIN/brcm-cs-qa-docs.aws/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/ENVTYPE/vmprod/g' /etc/supervisor/conf.d/supervisord.conf
  sed -i 's/AUTH_DYNAMIC/off' /etc/nginx/vhosts/brcm-cs-ui-vhosts
  sed -i 's/AUTH_DYNAMIC/"off"/g' /etc/nginx/sites-enabled/brcm-cs-ui-vhosts
  sed -i 's/PROXY_API_DEST/vmdr/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/UI_DEST_HOST/vmdr-ui.aws/g' /etc/nginx/redirects/docs-proxying.conf
  #sed -i 's/UI_DEST_HOST/vmdr-ui.cloud2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/-REGION/.us-east-2/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/STATICBUCKET/vmprod/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/docs-proxying.conf
  sed -i 's/LOGOSSBUCKET/broadcom-logos/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/CMURL/broadcom-prod/g' /etc/nginx/redirects/proxying.conf
  sed -i 's/DOCSBUCKET/vmavagodocs/g' /etc/nginx/redirects/vmdocs-proxy.conf
  sed -i 's/-REGION/.us-west-1/g' /etc/nginx/redirects/vmdocs-proxy.conf

fi
#sed -i "s/PROXY_API_DEST/$env-api-$bcnode-alb/g" /etc/nginx/redirects/proxying.conf
#sed -i "s/PROXY_API_DEST/$env-api-$bcnode-alb/g" /etc/nginx/nginx.conf
sed -i "s/PROXY_API_DEST.aws.broadcom.com/$env-api-$bcnode-alb.cloud2.vmware.com/g" /etc/nginx/redirects/proxying.conf
sed -i "s/PROXY_API_DEST.aws.broadcom.com/$env-api-$bcnode-alb.cloud2.vmware.com/g" /etc/nginx/nginx.conf

sed -i "s/BC_UI_NODE/$env-$bcnode/g" /etc/nginx/redirects/proxying.conf

cat /etc/supervisor/conf.d/supervisord.conf