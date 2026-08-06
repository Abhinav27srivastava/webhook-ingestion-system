const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options ={
    // we can add swagger definition here like api info ,name,version,description etc
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Webhook Ingestion System API",
            version: "v1.0.0",
            description: "Webhook Ingestion System built with Express.js, PostgreSQL, Redis, JWT Authentication, Role-Based Access Control (RBAC), Docker and Swagger Documentation."
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
        }],
        contacts: {
            name: "Abhinav Srivastava",
            email: "srivastavaabhinav307@gmail.com",
            url: "https://github.com/Abhinav27srivastava"
        },
        externalDocs: {
    description: "GitHub Repository",
    url: "https://github.com/Abhinav27srivastava/webhook-ingestion-system"
}
    },
    // we can specify the files containing the API documentation
    apis: ["./src/routes/*.js"]
};
const swaggerSpec = swaggerJsDoc(options);  
module.exports ={
    swaggerUi,
    swaggerSpec
}