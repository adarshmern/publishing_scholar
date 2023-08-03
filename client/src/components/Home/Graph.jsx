import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Chartd3 = ({ data }) => {
    const chartRef = useRef();

    useEffect(() => {
      if (data && data.length > 0) {
        drawChart();
      }
    }, [data]);
  
    function drawChart (){
      const svg = d3.select(chartRef.current);
      const width = 400;
      const height = 300;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
  
      const groupKeys = Object.keys(data[0]).filter(key => key !== 'group');
  
      const x0 = d3.scaleBand()
        .domain(data.map(d => d.group))
        .range([0, chartWidth])
        .paddingInner(0.1);
  
      const x1 = d3.scaleBand()
        .domain(groupKeys)
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(groupKeys, key => d[key]))])
        .range([chartHeight, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(groupKeys)
        .range(d3.schemeSet2);
  
      const chart = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
      chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x0));
  
      chart.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));
  
      const group = chart.selectAll('.group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'group')
        .attr('transform', d => `translate(${x0(d.group)}, 0)`);
  
      group.selectAll('rect')
        .data(d => groupKeys.map(key => ({ key, value: d[key] })))
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => chartHeight - y(d.value))
        .attr('fill', d => color(d.key));
    };
  
    return <svg ref={chartRef} width={400} height={300}></svg>;
};

export default Chartd3;
