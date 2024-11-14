import React, { useEffect, useState } from 'react';
import { Line, LineConfig } from '@ant-design/charts';
import axios from 'axios';

const EfficiencyChart: React.FC = () => {
  const [efficiencyData, setEfficiencyData] = useState<{ year: number; value: number; type: string }[]>([]);

  useEffect(() => {
    const fetchEfficiencyData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/fetch-data?range=RTE Calcs!A31:L51');
        const fetchedData = response.data;

        // Parse fetched data into chart-compatible format
        const parsedData = fetchedData.flatMap((row: string[]) => {
          const year = parseInt(row[0], 10);
          return row.slice(1).map((value, i) => ({
            year,
            value: parseFloat(value),
            option: [
              'Option 1 (Demo Manual)',
              'Option 2 (Demo Manual)',
              'Option 3 (Demo Manual)',
              'Option 4 (Demo Manual)',
              'Option 5 (Demo Manual)',
              'Option 1 (Optimized)',
              'Option 2 (Optimized)',
              'Option 3 (Optimized)',
              'Option 4 (Optimized)',
              'Option 5 (Optimized)',
              'Project Requirement',
            ][i],
          }));
        });

        setEfficiencyData([...parsedData]);
      } catch (error) {
        console.error('Error fetching efficiency data:', error);
      }
    };

    fetchEfficiencyData();
  }, []);

  const config: LineConfig = {
    data: efficiencyData,
    xField: 'year',
    yField: 'value',
    seriesField: 'option', // Ensures type names show in the legend
    smooth: true,
    yAxis: { title: { text: 'Round-Trip Efficiency at POI (%)' } },
    xAxis: { title: { text: 'Year' } },
    legend: {
      color: {
        title: false, // try passing this property
        position: 'bottom',
        rowPadding: 15,
      },
    },
    height: 500,
    colorField: 'option',
    style: {
      lineWidth: 2,
      lineDash: (data:{ year: number; value: number; option: string }[]) => {
        if (data[0].option === 'Project Requirement') return [4, 4];
      },
    }
  };

  return <Line {...config} />;
};

export default EfficiencyChart;
