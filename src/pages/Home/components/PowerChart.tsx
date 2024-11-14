import React, { useEffect, useState } from 'react';
import { Line, LineConfig } from '@ant-design/charts';
import axios from 'axios';

interface PowerChartProps {
  requiredPower: number;
}

const PowerChart: React.FC<PowerChartProps> = ({ requiredPower }) => {
  const [powerData, setPowerData] = useState<{ year: number; value: number; type: string }[]>([]);

  useEffect(() => {
    const fetchPowerData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/fetch-data?range=Energy Power Sizing Calcs!A501:K521'); // Replace with your API endpoint
        const fetchedData = response.data;
        const requiredData: { year: number; value: number; option: string }[] = [];

        // Parse fetched data into chart-compatible format
        const parsedData = fetchedData.flatMap((row: string[]) => {
          const year = parseInt(row[0], 10);
          requiredData.push({
            year,
            value: requiredPower,
            option: 'Required Power',
        });
          return row.slice(1).map((value, i) => ({
            year,
            value: parseFloat(value),
            option: [
              'Option 1 (Demo Manual)',
              'Option 2 (Demo Manual)',
              'Option 3 (Demo Manual)',
              'Option 5 (3 Augments)',
              'Option 5 (Overbuild)',
              'Option 1 (Optimized)',
              'Option 2 (Optimized)',
              'Option 3 (Optimized)',
              'Option 4 (Optimized)',
              'Option 5 (Optimized)',
            ][i],
          }));
        });
        setPowerData([...parsedData, ...requiredData]);
      } catch (error) {
        console.error('Error fetching power data:', error);
      }
    };

    fetchPowerData();
  }, [requiredPower]);

  const config: LineConfig = {
    data: powerData,
    xField: 'year',
    yField: 'value',
    seriesField: 'option',  // This ensures option names show in the legend
    smooth: true,
    yAxis: { title: { text: 'Power at POI (MW)' } },
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
        if (data[0].option === 'Required Power') return [4, 4];
      },
    }
  };

  return <Line {...config} />;
};

export default PowerChart;
