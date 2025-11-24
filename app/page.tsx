"use client";

import { useMemo, useState } from "react";
import ConfiguracionTransporte, {
  DatosTransporte,
} from "./components/ConfiguracionTransporte";
import {
  ResultadoMetodoBase,
  ResultadoMetodoConPasos,
  calcularCostoMinimo,
  calcularEsquinaNoroeste,
  calcularVogel,
} from "@/lib/metodosTransporte";

type MetodoId = "esquina" | "costoMinimo" | "vogel";
type ResultadoMetodo = ResultadoMetodoBase | ResultadoMetodoConPasos;

const METODOS: Record<
  MetodoId,
  {
    nombre: string;
    descripcion: string;
    gradiente: string;
    icono: React.ReactNode;
    border: string;
    badge: string;
    tabla: string;
  }
> = {
  esquina: {
    nombre: "Esquina Noroeste",
    descripcion: "Solución básica rápida para iniciar la iteración.",
    gradiente: "from-blue-500 to-indigo-500",
    icono: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    border: "border-blue-200 dark:border-blue-800",
    badge: "text-blue-600 dark:text-blue-300",
    tabla: "bg-blue-100 dark:bg-blue-900",
  },
  costoMinimo: {
    nombre: "Costo Mínimo",
    descripcion: "Prioriza rutas económicas para mejorar el costo inicial.",
    gradiente: "from-purple-500 to-pink-500",
    icono: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    border: "border-purple-200 dark:border-purple-800",
    badge: "text-purple-600 dark:text-purple-300",
    tabla: "bg-purple-100 dark:bg-purple-900",
  },
  vogel: {
    nombre: "Aproximación de Vogel",
    descripcion: "Usa penalizaciones para acercarse más al óptimo.",
    gradiente: "from-indigo-500 to-cyan-500",
    icono: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    border: "border-indigo-200 dark:border-indigo-800",
    badge: "text-indigo-600 dark:text-indigo-300",
    tabla: "bg-indigo-100 dark:bg-indigo-900",
  },
};

const formatearNumero = (valor: number, decimales = 0) =>
  valor.toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

const calculadoras: Record<
  MetodoId,
  (datos: DatosTransporte) => ResultadoMetodo
> = {
  esquina: calcularEsquinaNoroeste,
  costoMinimo: calcularCostoMinimo,
  vogel: calcularVogel,
};

export default function Home() {
  const [mostrarConstructor, setMostrarConstructor] = useState(false);
  const [datosGuardados, setDatosGuardados] = useState<DatosTransporte | null>(
    null
  );
  const [resultados, setResultados] = useState<
    Partial<Record<MetodoId, ResultadoMetodo>>
  >({});
  const [metodoSeleccionado, setMetodoSeleccionado] =
    useState<MetodoId | null>(null);
  const [metodoEnEjecucion, setMetodoEnEjecucion] = useState<
    MetodoId | "comparativa" | null
  >(null);
  const [mostrarComparativa, setMostrarComparativa] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const datosListos = Boolean(datosGuardados);

  const resumenProblema = useMemo(() => {
    if (!datosGuardados) return null;
    return {
      origenes: datosGuardados.numOrigenes,
      destinos: datosGuardados.numDestinos,
      totalOferta: datosGuardados.ofertas.reduce((acc, val) => acc + val, 0),
      totalDemanda: datosGuardados.demandas.reduce(
        (acc, val) => acc + val,
        0
      ),
    };
  }, [datosGuardados]);

  const guardarDatos = (datos: DatosTransporte) => {
    setDatosGuardados(datos);
    setResultados({});
    setMostrarComparativa(false);
    setMetodoSeleccionado(null);
    setErrorMensaje(null);
  };

  const resolverMetodo = (metodo: MetodoId | "comparativa") => {
    if (!datosGuardados) {
      setErrorMensaje("Primero registre y guarde los datos del problema.");
      return;
    }

    try {
      setMetodoEnEjecucion(metodo);
      if (metodo === "comparativa") {
        const todos: Partial<Record<MetodoId, ResultadoMetodo>> = {
          esquina: calculadoras.esquina(datosGuardados),
          costoMinimo: calculadoras.costoMinimo(datosGuardados),
          vogel: calculadoras.vogel(datosGuardados),
        };
        setResultados(todos);
        setMostrarComparativa(true);
        setMetodoSeleccionado(null);
      } else {
        const nuevoResultado = calculadoras[metodo](datosGuardados);
        setResultados((prev) => ({ ...prev, [metodo]: nuevoResultado }));
        setMetodoSeleccionado(metodo);
        setMostrarComparativa(false);
      }
      setErrorMensaje(null);
    } catch (error) {
      setErrorMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo resolver el problema."
      );
    } finally {
      setMetodoEnEjecucion(null);
    }
  };

  const renderResultado = (metodo: MetodoId, resultado: ResultadoMetodo) => {
    const config = METODOS[metodo];
    const tienePasos =
      "pasos" in resultado && Array.isArray(resultado.pasos) && resultado.pasos;

    return (
      <section
        key={metodo}
        className={`bg-white/90 dark:bg-gray-900/80 ${config.border} border rounded-2xl shadow-lg p-6 backdrop-blur space-y-6`}
      >
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div>
            <p
              className={`text-sm uppercase tracking-wide font-semibold ${config.badge}`}
            >
              Resultado del método
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.nombre}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {config.descripcion}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Costo total
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-300">
              {formatearNumero(resultado.costoTotal, 2)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-200">Orígenes</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {resultado.origenes.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Destinos
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {resultado.destinos.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
            <p className="text-sm text-indigo-700 dark:text-indigo-200">
              Asignaciones
            </p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {resultado.asignaciones.reduce(
                (count, fila) => count + fila.filter((val) => val > 0).length,
                0
              )}
            </p>
          </div>
        </div>

        {tienePasos && (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-800/40">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Bitácora del algoritmo
            </p>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-decimal pl-5">
              {(resultado as ResultadoMetodoConPasos).pasos.slice(0, 6).map(
                (paso, index) => (
                  <li key={`${metodo}-paso-${index}`}>{paso}</li>
                )
              )}
              {(resultado as ResultadoMetodoConPasos).pasos.length > 6 && (
                <li className="text-gray-400">...</li>
              )}
            </ol>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Tabla de asignaciones
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={config.tabla}>
                  <th className="border p-3 dark:border-gray-700 text-left">
                    Origen / Destino
                  </th>
                  {resultado.destinos.map((destino, idx) => (
                    <th
                      key={`${metodo}-dest-${idx}`}
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
                    key={`${metodo}-fila-${filaIdx}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="border p-3 font-semibold bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                      {resultado.origenes[filaIdx]}
                    </td>
                    {fila.map((valor, colIdx) => (
                      <td
                        key={`${metodo}-${filaIdx}-${colIdx}`}
                        className={`border p-3 text-center dark:border-gray-700 ${
                          valor > 0
                            ? "bg-green-100 dark:bg-green-900 font-semibold"
                            : ""
                        }`}
                      >
                        {valor > 0 ? (
                          <div>
                            <p className="text-base">
                              {formatearNumero(valor)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              costo {resultado.costos[filaIdx][colIdx]}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
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
    );
  };

  const renderResultados = () => {
    if (mostrarComparativa) {
      return (
        <div className="space-y-8">
          {(Object.keys(METODOS) as MetodoId[]).map((metodo) =>
            resultados[metodo]
              ? renderResultado(metodo, resultados[metodo]!)
              : null
          )}
        </div>
      );
    }

    if (metodoSeleccionado && resultados[metodoSeleccionado]) {
      return renderResultado(
        metodoSeleccionado,
        resultados[metodoSeleccionado]!
      );
    }

    if (datosGuardados) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-300">
          Seleccione un método o ejecute la comparativa para ver resultados.
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <header className="pt-16 pb-8 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Programación Lineal
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100">
              Laboratorio de Transporte
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Registre los datos una sola vez, resuelva con el método que
              prefiera y compare los resultados sin salir del tablero.
            </p>
          </div>
          <button
            onClick={() => setMostrarConstructor(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <span>{mostrarConstructor ? "Continuar" : "Iniciar problema"}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
        

        {mostrarConstructor && (
          <section className="space-y-10">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200/70 dark:border-gray-800 p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap justify-between gap-4 items-end">
                <div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                    Paso 1
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Configurar el problema
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Diligencie las dimensiones, ofertas, demandas y costos y
                    pulse Guardar.
                  </p>
                </div>
                {resumenProblema && (
                  <div className="text-sm text-right text-gray-600 dark:text-gray-300">
                    <p>
                      Orígenes:{" "}
                      <span className="font-semibold">
                        {resumenProblema.origenes}
                      </span>{" "}
                      · Destinos:{" "}
                      <span className="font-semibold">
                        {resumenProblema.destinos}
                      </span>
                    </p>
                    <p>
                      Oferta total:{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-300">
                        {formatearNumero(resumenProblema.totalOferta)}
                      </span>{" "}
                      | Demanda total:{" "}
                      <span className="font-semibold text-purple-600 dark:text-purple-300">
                        {formatearNumero(resumenProblema.totalDemanda)}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <ConfiguracionTransporte
                onCalcular={guardarDatos}
                textoBoton="Guardar datos del problema"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200/70 dark:border-gray-800 p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap justify-between gap-4 items-end">
                <div>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                    Paso 2
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Resolver y comparar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use los botones para obtener cada solución o ejecute la
                    comparativa para obtener las tres.
                  </p>
                </div>
                {datosListos && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200 text-sm font-semibold">
                    Datos listos
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(METODOS) as MetodoId[]).map((metodo) => (
                  <button
                    key={`resolver-${metodo}`}
                    onClick={() => resolverMetodo(metodo)}
                    disabled={!datosListos || metodoEnEjecucion !== null}
                    className={`rounded-2xl border ${METODOS[metodo].border} px-5 py-6 text-left transition-all ${
                      datosListos
                        ? "hover:shadow-lg hover:-translate-y-0.5"
                        : "opacity-50 cursor-not-allowed"
                    } ${
                      metodoSeleccionado === metodo && !mostrarComparativa
                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-green-400"
                        : ""
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                      Resolver con
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {METODOS[metodo].nombre}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {METODOS[metodo].descripcion}
                    </p>
                    {resultados[metodo] && !mostrarComparativa && (
                      <p className="mt-3 text-sm text-green-600 dark:text-green-300">
                        Último costo:{" "}
                        <span className="font-semibold">
                          {formatearNumero(resultados[metodo]!.costoTotal, 2)}
                        </span>
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-5">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    ¿Necesita ver las tres soluciones al mismo tiempo?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    El botón comparativa corre simultáneamente Esquina, Costo
                    Mínimo y Vogel y despliega cada tabla con su costo total.
                  </p>
                </div>
                <button
                  onClick={() => resolverMetodo("comparativa")}
                  disabled={!datosListos || metodoEnEjecucion !== null}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {metodoEnEjecucion === "comparativa"
                    ? "Calculando..."
                    : "Comparativa (3 métodos)"}
                </button>
              </div>

              {errorMensaje && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 text-red-800 px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                  {errorMensaje}
                </div>
              )}
            </div>

            {renderResultados()}
          </section>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Parcial 3 - Programación Lineal
            </p>
            <p className="text-md text-gray-600 dark:text-gray-300 mb-4">
              Integrantes:
            </p>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-200">Sheyla Daza</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-200">
                  Julian Gutiérrez
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

