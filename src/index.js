import * as d3 from 'd3-jetpack/build/d3v4+jetpack';
import legend from 'd3-svg-legend';

d3.queue()
    .defer(d3.json, 'json_data/final_min/all_counts.json')
    .defer(d3.json, 'json_data/final_min/ny_counts.json')
    .defer(d3.json, 'json_data/final_min/mwdl_counts.json')
    .defer(d3.json, 'json_data/final_min/nc_counts.json')
    .await(function(error, all, esdn, mwdl, nc) {
        let render = () => {
            let width = window.innerWidth - 50;
            let div = d3.select('.tooltip');

            const color = (value) => {
                let colorFormat = (coloring) => {
                    let col = d3.hsl(coloring);

                    return col + "";
                };

                let color;

                if (value === 'Not in Copyright') {
                    color = colorFormat('#f4a582');
                } else if (value === 'In Copyright') {
                    color = colorFormat('#d1e5f0');
                } else if (value === 'Creative Commons') {
                    color = colorFormat('#f1b6da');
                } else {
                    color = colorFormat('#b8e186');
                }

                return color;
            };

            const mapped = (data, selector, map_height = 500) => {
                let file_type = selector.split('#')[1];

                let treemap = d3.treemap()
                    .tile(d3.treemapBinary)
                    .size([width, map_height])
                    .round(true)
                    .paddingInner(1);

                let root = d3.hierarchy(data)
                    .sum(function (d) {
                        return d.total;
                    });

                treemap(root);

                let nodes = d3.select(selector)
                    .attr('height', map_height)
                    .attr('width', width)
                    .selectAll('g')
                    .data(root.leaves())
                    .enter()
                    .append('g')
                    .translate((d) => {
                        return [d.x0, d.y0];
                    });

                nodes.append('rect')
                    .attr('width', (d) => {
                        return d.x1 - d.x0;
                    })
                    .attr('height', (d) => {
                        return d.y1 - d.y0;
                    })
                    .attr('fill', (d) => {
                        return color(d.data.type);
                    })
                    .on('mouseover touchstart', function (d) {

                        div.transition()
                            .duration(100)
                            .style('opacity', .9);

                        div.html(
                            `<p>${d.data.rights}</p>`
                        ).style('top', (d3.event.pageY + 10) + 'px')
                            .style('left', (d3.event.pageX - 55) + 'px');
                    })
                    .on('mouseout touchend', function (d) {
                        div.transition()
                            .duration(250)
                            .style('opacity', 0);
                    })
                    .on('click', (d) => {
                        let base = {
                            'name': file_type
                        };

                        base['children'] = data.children.filter((e) => {
                            return e.name === d.data.type;
                        });

                        zoom(base, d);
                    });

                nodes.append('text')
                    .attr('dx', 4)
                    .attr('dy', 14)
                    .text((d) => {
                        return d.data.rights;
                    });
            };

            let legendOrientation = () => {
                let size, orientation, legend_height, legend_width;

                if(width < 800) {
                    size = 40;
                    orientation = 'vertical';
                    legend_height = 120;
                    legend_width = 200;
                } else {
                    size = 130;
                    orientation = 'horizontal';
                    legend_height = 70;
                    legend_width = width;
                }

                return {
                    size: size,
                    orientation: orientation,
                    height: legend_height,
                    width: legend_width
                };
            };

            let dpla_legend = (selector) => {
                let rights = [
                    'Not in Copyright',
                    'In Copyright',
                    'Creative Commons',
                    'Unknown'
                    ];

                let colors = [
                    '#f4a582',
                    '#d1e5f0',
                    '#f1b6da',
                    '#b8e186'
                ];

                let legend_scales = d3.scaleOrdinal()
                    .domain(rights)
                    .range(colors);
                let configs = legendOrientation();

                let svg = d3.select(selector);

                svg.attr("width", configs.width)
                    .attr('height', configs.height);

                svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(20,20)");

                let legendz = legend.legendColor()
                    .shapeWidth(configs.size)
                    .orient(configs.orientation)
                    .shapePadding(10)
                    .scale(legend_scales);

                svg.select(".legend")
                    .call(legendz);
            };

            dpla_legend('#all-legend');
            mapped(all, '#all', 700);
            mapped(esdn, '#esdn', 500);
            mapped(mwdl, '#mwdl', 500);
            mapped(nc, '#nc', 500);

            d3.selectAll('.row, .row hide').classed('hide', false);
            d3.selectAll('.leg').style('opacity', 1);
            d3.select('#load').classed('hide', true);
        };

        render();

        window.addEventListener('resize', render);
    });
