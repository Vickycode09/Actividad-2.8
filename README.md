# Nexo — directorio del equipo

Aplicación CRUD para administrar empleados con Angular, formularios reactivos y una API REST local.

## Requisitos

- Node.js y npm
- Instalar las dependencias del proyecto con `npm install`

## Iniciar la aplicación

```bash
npm start
```

El comando inicia la API REST local y Angular en paralelo. Abre `http://localhost:4200/`.
La API utiliza `db.json` como almacenamiento y escucha en el puerto `3000`; Angular la consume mediante `/api`.
Si Angular ya está ejecutándose en otra terminal, inicia solo la API con `npm run api`. Si el directorio mostró un error antes de iniciar la API, pulsa **Reintentar** en el aviso.

## Operaciones disponibles

- Consultar y buscar empleados (GET).
- Agregar perfiles validados (POST).
- Editar perfiles existentes (PUT).
- Confirmar y eliminar perfiles (DELETE).

Los cambios se guardan en `db.json`. El archivo contiene registros de ejemplo y puede restaurarse desde Git para volver a los datos iniciales.

## Pruebas y compilación

```bash
npm test -- --watch=false
npm run build
```
