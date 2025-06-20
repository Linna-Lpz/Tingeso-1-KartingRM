# 🏎️ KartingRM – Sistema de Gestión de Karting

Proyecto realizado para la asignatura "Técnicas de Ingenierías de Software". Desarrollado con Spring Boot que permite gestionar aspectos relacionados con una pista de karting. Incluye funcionalidades de backend, persistencia de datos en PostgreSQL, exportación de reportes en Excel y PDF, envío de correos y despliegue mediante Docker y Jenkins.

---

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

- Java 17
- Maven 3.8+
- Docker (opcional, para usar contenedores)
- PostgreSQL (configurado localmente o remotamente)
- Jenkins (opcional, para integración continua)

---

## ⚙️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Linna-Lpz/Tingeso-1-KartingRM.git
   cd Tingeso-1-KartingRM

2. Compila el proyecto:
   ```bash
   mvn clean install
   
3. Crea la base de datos PostgreSQL y configura el archivo application.properties (o .yml) con tus credenciales.

---

## 🚀 Ejecución

### Localmente
  ```bash
   mvn spring-boot:run
  ```

La aplicación estará disponible por defecto en: http://localhost:8090
   
### Con Docker
1. Generar el JAR
    ```bash
     mvn clean package
    ```

2. Construye y ejecuta el contenedor
    ```bash
    docker build -t karting-backend .
    docker run -p 8090:8090 karting-backend
