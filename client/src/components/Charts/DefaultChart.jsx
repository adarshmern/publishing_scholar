import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DefaultChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    function formatDate(dateString) {
      const dateParts = dateString.split("/");
      return `${dateParts[0]}/${parseInt(dateParts[1]) + 1}`;
    }

    const formattedData = data.map((entry) => ({
      ...entry,
      date: formatDate(entry.date),
    }));

    setChartData({
      series: [
        {
          name: "Efficiency",
          data: formattedData.map((entry) => entry.efficiency),
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "bar",
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        title: {
          text: "Efficiency per Day",
          align: "left",
        },
        xaxis: {
          categories: formattedData.map((entry) => entry.date),
          title: {
            text: "Date",
          },
        },
        yaxis: {
          title: {
            text: "Efficiency",
          },
        },
      },
    });
  }, [data]);

  if (!chartData) {
    return null; 
  }

  return <Chart options={chartData.options} series={chartData.series} type="bar" width={800} />;
};

export default DefaultChart;
