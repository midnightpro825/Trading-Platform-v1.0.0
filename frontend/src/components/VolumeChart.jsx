import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const VolumeChart = ({ data }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    try {
      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 80,
        layout: {
          background: { color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: 'transparent' },
          horzLines: { color: 'transparent' },
        },
        timeScale: {
          visible: false,
        },
        rightPriceScale: {
          visible: false,
        },
        crosshair: {
          mode: 0,
        },
      });

      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
      });

      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume || Math.random() * 10,
        color: item.close >= item.open ? '#0ecb81' : '#f6465d',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
      chartRef.current = chart;

      const handleResize = () => {
        if (chartRef.current && containerRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (err) {
      console.error('Volume chart error:', err);
    }
  }, [data]);

  return <div ref={containerRef} className="volume-chart" />;
};

export default VolumeChart;