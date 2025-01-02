# Pages #
Pages can either be page templates dependent on the CMS or one off. Case is one way of determining which is which. If the filename is Capital, than it's a CMS template. If it's lower case than, it's a one off.

## Folders ##
Folder structre will help organize the pages. The structure will try to follow the url path.

## Routing ##
Routing determines which template file to use. TemplateRouter.jsx is the main engine. It grabs the JSON from the backend and produces the proper page based on the template name.