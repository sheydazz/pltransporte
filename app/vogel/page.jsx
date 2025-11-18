'use client';
import React from 'react';
import Link from 'next/link';
import ConfiguracionTransporte from '../components/ConfiguracionTransporte';

function Vogel() {
  const handleCalcular = (datos) => {
    console.log('Datos recibidos:', datos);
    // Aquí implementaremos el algoritmo de Vogel
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-indigo-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            Método de Aproximación de Vogel
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Ingrese los datos del problema de transporte</p>
        </div>

        <ConfiguracionTransporte 
          onCalcular={handleCalcular}
          colorPrimario="indigo"
          colorSecundario="cyan"
        />
      </div>
    </div>
  );
}

export default Vogel;