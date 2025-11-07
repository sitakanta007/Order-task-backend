import express from "express";
import cors from "cors";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./docs/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// All routes
app.use("/api", routes);

export default app;
