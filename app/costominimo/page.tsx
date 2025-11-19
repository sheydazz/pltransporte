"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import ConfiguracionTransporte, {
  DatosTransporte,
} from "../components/ConfiguracionTransporte";

/**
 * Interface que define la estructura del resultado del método del Costo Mínimo
 */
interface ResultadoCostoMinimo {
  asignaciones: number[][];
  costoTotal: number;
  pasos: string[];
  origenes: string[];
  destinos: string[];
  costos: number[][];
}

/**
 * Formatea un número con separadores de miles y decimales
 * @param valor - Número a formatear
 * @param decimales - Número de decimales a mostrar (por defecto 0)
 * @returns String formateado según la localización española
 */
const formatearNumero = (valor: number, decimales = 0) =>
  valor.toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

/**
 * Implementa el algoritmo del Costo Mínimo para resolver problemas de transporte.
 * 
 * Este método determina una mejor solución inicial al concentrarse en las rutas más económicas:
 * 1. Asigna lo más posible a la celda con el costo unitario mínimo
 * 2. Tacha la fila o columna satisfecha y ajusta ofertas/demandas
 * 3. Selecciona la siguiente celda no tachada con costo mínimo
 * 4. Repite hasta que quede exactamente una fila o columna sin tachar
 * 
 * @param datos - Datos del problema de transporte (orígenes, destinos, ofertas, demandas, costos)
 * @returns Objeto con las asignaciones, costo total, pasos del algoritmo y datos originales
 * @throws Error si el problema no está balanceado (oferta total ≠ demanda total)
 */
function calcularCostoMinimo(datos: DatosTransporte): ResultadoCostoMinimo {
  const { origenes, destinos } = datos;
  const suministros = datos.ofertas.map((valor) => Number(valor));
  const demandas = datos.demandas.map((valor) => Number(valor));
  const costos = datos.costos.map((fila) => fila.map((valor) => Number(valor)));

  const totalOferta = suministros.reduce((acc, val) => acc + val, 0);
  const totalDemanda = demandas.reduce((acc, val) => acc + val, 0);

  if (totalOferta !== totalDemanda) {
    throw new Error(
      `El problema no está balanceado. Oferta total: ${totalOferta}, Demanda total: ${totalDemanda}.`
    );
  }

  const asignaciones = suministros.map(() =>
    Array(demandas.length).fill(0)
  );
  const pasos: string[] = [];

  let numeroPaso = 1;

  /**
   * Encuentra la celda disponible (no tachada) con el costo unitario mínimo
   * @returns Objeto con las coordenadas {fila, col} de la celda de menor costo, o null si no hay más celdas
   */
  const obtenerSiguienteCelda = () => {
    let minCosto = Number.POSITIVE_INFINITY;
    let pos: { fila: number; col: number } | null = null;
    for (let i = 0; i < suministros.length; i++) {
      if (suministros[i] === 0) continue;
      for (let j = 0; j < demandas.length; j++) {
        if (demandas[j] === 0) continue;
        const costo = costos[i][j];
        if (costo < minCosto) {
          minCosto = costo;
          pos = { fila: i, col: j };
        }
      }
    }
    return pos;
  };

  while (true) {
    const siguiente = obtenerSiguienteCelda();
    if (!siguiente) break;
    const { fila: i, col: j } = siguiente;

    const cantidad = Math.min(suministros[i], demandas[j]);
    const ofertaAntes = suministros[i];
    const demandaAntes = demandas[j];

    asignaciones[i][j] = cantidad;
    suministros[i] -= cantidad;
    demandas[j] -= cantidad;

    pasos.push(
      `Paso ${numeroPaso}: Se asignan ${cantidad} unidades en la celda (${origenes[i]} → ${destinos[j]}), costo unitario ${costos[i][j]}. Oferta ${origenes[i]}: ${ofertaAntes}→${suministros[i]}, Demanda ${destinos[j]}: ${demandaAntes}→${demandas[j]}.`
    );
    numeroPaso++;

    if (suministros[i] === 0 && demandas[j] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} y la demanda de ${destinos[j]} quedaron en 0 simultáneamente. Se tacha solo una de las dos y se deja el 0 visible en la otra, continuando con la siguiente celda de costo mínimo.`
      );
    } else if (suministros[i] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} se agotó. Se tacha la fila correspondiente.`
      );
    } else if (demandas[j] === 0) {
      pasos.push(
        `La demanda de ${destinos[j]} se satisfizo. Se tacha la columna correspondiente.`
      );
    }
  }

  const costoTotal = asignaciones.reduce((total, fila, filaIdx) => {
    return (
      total +
      fila.reduce(
        (acc, valor, colIdx) => acc + valor * costos[filaIdx][colIdx],
        0
      )
    );
  }, 0);

  return {
    asignaciones,
    costoTotal,
    pasos,
    origenes,
    destinos,
    costos,
  };
}

/**
 * Componente principal de la página del Método del Costo Mínimo
 * Maneja la recolección de datos, cálculo y visualización de resultados
 */
function CostoMinimo() {
  const [resultado, setResultado] = useState<ResultadoCostoMinimo | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  /**
   * Maneja el cálculo de la solución cuando el usuario presiona "Calcular Solución"
   * @param datos - Datos del problema de transporte ingresados por el usuario
   */
  const handleCalcular = (datos: DatosTransporte) => {
    try {
      const nuevoResultado = calcularCostoMinimo(datos);
      setResultado(nuevoResultado);
      setErrorMensaje(null);
    } catch (error) {
      setResultado(null);
      setErrorMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo calcular la solución inicial."
      );
    }
  };

  /**
   * Calcula el número total de asignaciones realizadas (celdas con valor > 0)
   * Se recalcula automáticamente cuando cambia el resultado
   */
  const asignacionesRealizadas = useMemo(() => {
    if (!resultado) return 0;
    return resultado.asignaciones.reduce(
      (count, fila) => count + fila.filter((val) => val > 0).length,
      0
    );
  }, [resultado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Método del Costo Mínimo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ingrese los datos del problema de transporte
          </p>
        </div>

        <ConfiguracionTransporte
          onCalcular={handleCalcular}
          colorPrimario="purple"
          colorSecundario="pink"
        />

        {errorMensaje && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50/80 text-red-800 px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
            {errorMensaje}
          </div>
        )}

        {resultado && (
          <section className="mt-6 space-y-6">
            <div className="bg-white/90 dark:bg-gray-900/80 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-lg p-6 backdrop-blur">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-purple-600 dark:text-purple-300 font-semibold">
                    Solución Básica Inicial
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Costo Mínimo
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Asignaciones realizadas
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                    {asignacionesRealizadas}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Costo total
                  </p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">
                    {resultado.costoTotal}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800">
                  <p className="text-sm text-pink-700 dark:text-pink-200">
                    Orígenes
                  </p>
                  <p className="text-2xl font-bold text-pink-800 dark:text-pink-100">
                    {resultado.origenes.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                  <p className="text-sm text-indigo-700 dark:text-indigo-200">
                    Destinos
                  </p>
                  <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-100">
                    {resultado.destinos.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/80 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tabla de asignaciones
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-100 dark:bg-purple-900">
                      <th className="border p-3 dark:border-gray-700">
                        Origen / Destino
                      </th>
                      {resultado.destinos.map((destino, idx) => (
                        <th
                          key={destino + idx}
                          className="border p-3 dark:border-gray-700"
                        >
                          {destino}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.asignaciones.map((fila, filaIdx) => (
                      <tr
                        key={resultado.origenes[filaIdx]}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="border p-3 font-semibold bg-purple-50 dark:bg-purple-900 dark:border-gray-700">
                          {resultado.origenes[filaIdx]}
                        </td>
                        {fila.map((valor, colIdx) => (
                          <td
                            key={`${filaIdx}-${colIdx}`}
                            className={`border p-3 text-center dark:border-gray-700 ${
                              valor > 0
                                ? "bg-green-100 dark:bg-green-900 font-bold"
                                : ""
                            }`}
                          >
                            {valor > 0 ? (
                              <div>
                                <p className="text-lg">
                                  {formatearNumero(valor)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-300">
                                  costo {resultado.costos[filaIdx][colIdx]}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

        
          </section>
        )}
      </div>
    </div>
  );
}

export default CostoMinimo;