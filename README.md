# Problema de Transporte - Programación Lineal

Aplicación web desarrollada con Next.js para resolver problemas de transporte utilizando tres métodos diferentes de programación lineal.

##  Descripción

Esta aplicación permite resolver problemas de transporte mediante tres algoritmos:

1. **Método de la Esquina Noroeste** - Algoritmo simple que inicia en la esquina noroeste de la matriz
2. **Método del Costo Mínimo** - Optimiza los costos eligiendo primero las rutas más económicas
3. **Método de Aproximación de Vogel (VAM)** - Método heurístico que considera penalizaciones para mejores soluciones

##  Estructura del Proyecto

```
pltransporte/
├── app/
│   ├── components/
│   │   └── ConfiguracionTransporte.tsx  # Componente reutilizable para recolección de datos
│   ├── esquina/
│   │   └── page.tsx                      # Página del método Esquina Noroeste
│   ├── costominimo/
│   │   └── page.tsx                      # Página del método Costo Mínimo
│   ├── vogel/
│   │   └── page.tsx                      # Página del método Vogel
│   ├── page.tsx                         # Página principal (home)
│   ├── layout.tsx                        # Layout principal
│   └── globals.css                       # Estilos globales
├── public/                               # Archivos estáticos
└── README.md                             # Este archivo
```

##  Inicio Rápido

### Instalación

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

##  Funcionalidades

### Recolección de Datos

El componente `ConfiguracionTransporte` permite:
- Configurar el número de orígenes y destinos (1-10)
- Nombrar cada origen y destino
- Ingresar ofertas (cantidad disponible en cada origen)
- Ingresar demandas (cantidad requerida en cada destino)
- Completar la matriz de costos (costo de transportar de cada origen a cada destino)

### Algoritmos Implementados

#### 1. Método de la Esquina Noroeste
- **Ubicación**: `app/esquina/page.tsx`
- **Función principal**: `calcularEsquinaNoroeste()`
- **Descripción**: Inicia en la esquina noroeste (arriba-izquierda) y asigna lo máximo posible, moviéndose a la derecha o abajo según corresponda.

#### 2. Método del Costo Mínimo
- **Ubicación**: `app/costominimo/page.tsx`
- **Función principal**: `calcularCostoMinimo()`
- **Descripción**: Selecciona siempre la celda con el costo unitario más bajo disponible, optimizando la solución inicial.

#### 3. Método de Aproximación de Vogel (VAM)
- **Ubicación**: `app/vogel/page.tsx`
- **Función principal**: `vogelMethod()`
- **Descripción**: Calcula penalizaciones (diferencia entre los dos menores costos) para cada fila y columna, seleccionando la de mayor penalización.

##  Características de la UI

- **Diseño Responsive**: Se adapta a dispositivos móviles y escritorio
- **Modo Oscuro**: Soporte completo para tema claro/oscuro
- **Interfaz Moderna**: Diseño con Tailwind CSS y gradientes
- **Visualización de Resultados**: Tablas interactivas con resaltado de asignaciones
- **Validación**: Verificación de problemas balanceados (oferta total = demanda total)

## 📝 Interfaces TypeScript

### DatosTransporte
```typescript
interface DatosTransporte {
  numOrigenes: number;
  numDestinos: number;
  origenes: string[];
  destinos: string[];
  ofertas: number[];
  demandas: number[];
  costos: number[][];
}
```

### Resultado (común a todos los métodos)
```typescript
interface Resultado {
  asignaciones: number[][];  // Matriz de asignaciones
  costoTotal: number;        // Costo total de la solución
  origenes: string[];        // Nombres de orígenes
  destinos: string[];        // Nombres de destinos
  costos: number[][];        // Matriz de costos original
}
```

## 🔧 Tecnologías Utilizadas

- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **ESLint** - Linter para calidad de código

## 👥 Integrantes

- **Sheyla Daza**
- **Julian Gutiérrez**

## 📄 Licencia

Proyecto académico - Parcial 3 de Programación Lineal

---

## 🎯 Uso

1. Selecciona uno de los tres métodos desde la página principal
2. Configura el número de orígenes y destinos
3. Ingresa los nombres, ofertas, demandas y costos
4. Presiona "Calcular Solución"
5. Visualiza los resultados con la tabla de asignaciones y el costo total

## ⚠️ Notas Importantes

- El problema debe estar **balanceado**: la suma de ofertas debe ser igual a la suma de demandas
- Los costos deben ser números positivos
- Las ofertas y demandas deben ser números no negativos
