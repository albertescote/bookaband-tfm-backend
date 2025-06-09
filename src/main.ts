import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import {
  FRONTEND_APP_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_PAGE_URL,
} from "./config";
import { AllExceptionsFilter } from "./app/filter/http-exception.filter";
import { LoggingInterceptor } from "./app/interceptor/logging.interceptor";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggingInterceptor());

  const allowedOrigins = [
    FRONTEND_AUTH_URL,
    FRONTEND_PAGE_URL,
    FRONTEND_APP_URL,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Content-Disposition",
    ],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
