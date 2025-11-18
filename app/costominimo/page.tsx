'use client';
import React from 'react';
import Link from 'next/link';
import ConfiguracionTransporte, { DatosTransporte } from '../components/ConfiguracionTransporte';

function CostoMinimo() {
  const handleCalcular = (datos: DatosTransporte) => {
    console.log('Datos recibidos:', datos);
    // Aquí implementaremos el algoritmo del Costo Mínimo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Método del Costo Mínimo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Ingrese los datos del problema de transporte</p>
        </div>

        <ConfiguracionTransporte 
          onCalcular={handleCalcular}
          colorPrimario="purple"
          colorSecundario="pink"
        />
      </div>
    </div>
  );
}

export default CostoMinimo;