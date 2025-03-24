import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import { FRONTEND_URL } from "./config";
import { AllExceptionsFilter } from "./app/filter/http-exception.filter";
import { LoggingInterceptor } from "./app/interceptor/logging.interceptor";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({
    origin: FRONTEND_URL,
    methods: ["POST", "GET"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
