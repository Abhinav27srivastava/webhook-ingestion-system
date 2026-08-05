const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options ={
    // we can add swagger definition here like api info ,name,version,description etc
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Webhook API",
            version: "1.0.0",
            description: "A simple Express API"
        },
        servers:[{
            url: "http://localhost:5000",
            description: "local server"
        },
        {
            url: "http://65.2.81.197:5000",
            description: "production server"
        }],
         components: {  
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security:[{
            bearerAuth: []
        }]
    },
    // we can specify the files containing the API documentation
    apis: ["./src/routes/*.js"]
};
const swaggerSpec = swaggerJsdoc(options);  
module.exports ={
    swaggerUi,
    swaggerSpec
}