"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import ConfiguracionTransporte, {
  DatosTransporte,
} from "../components/ConfiguracionTransporte";
import {
  ResultadoMetodoConPasos,
  calcularEsquinaNoroeste,
} from "@/lib/metodosTransporte";

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

function Esquina() {
  const [resultado, setResultado] = useState<ResultadoMetodoConPasos | null>(
    null
  );
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  /**
   * Maneja el cálculo de la solución cuando el usuario presiona "Calcular Solución"
   * @param datos - Datos del problema de transporte ingresados por el usuario
   */
  const handleCalcular = (datos: DatosTransporte) => {
    try {
      const nuevoResultado = calcularEsquinaNoroeste(datos);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Método de la Esquina Noroeste
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ingrese los datos del problema de transporte
          </p>
        </div>

        <ConfiguracionTransporte
          onCalcular={handleCalcular}
        />

        {errorMensaje && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50/80 text-red-800 px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
            {errorMensaje}
          </div>
        )}

        {resultado && (
          <section className="mt-6 space-y-6">
            <div className="bg-white/90 dark:bg-gray-900/80 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg p-6 backdrop-blur">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold">
                    Solución Básica Inicial
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Esquina Noroeste
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Asignaciones realizadas
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {asignacionesRealizadas}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Costo total
                  </p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                    {resultado.costoTotal}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Orígenes
                  </p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">
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

            <div className="bg-white/90 dark:bg-gray-900/80 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tabla de asignaciones
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-100 dark:bg-indigo-900">
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
                        <td className="border p-3 font-semibold bg-indigo-50 dark:bg-indigo-900 dark:border-gray-700">
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

export default Esquina;