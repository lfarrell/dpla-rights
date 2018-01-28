import * as d3 from 'd3-jetpack/build/d3v4+jetpack';

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
                    let c = d3.hsl(coloring);

                    return c + "";
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

            let legend = (selector) => {
                if (! document.querySelectorAll('.legend').length) {
                    let keys = [
                        'Creative Commons',
                        'No Known Copyright',
                        'Copyright Unknown',
                        'In Copyright'
                    ];

                    let legend = d3.select(selector)
                        .append('svg')
                        .attr('width', width / 2)
                        .attr('height', 55)
                        .attr('class', 'legend')
                        .translate([25, 0]);

                    let j = 0;

                    legend.selectAll('g').data(keys)
                        .enter()
                        .append('g').attr('width', 190)
                        .each(function (d) {
                            let g = d3.select(this);

                            g.append('rect')
                                .attr('x', j)
                                .attr('y', 15)
                                .attr('width', 10)
                                .attr('height', 10)
                                .style('fill', color(d));

                            g.append('text')
                                .attr('x', j + 15)
                                .attr('y', 25)
                                .attr('height', 30)
                                .attr('width', d.length * 50)
                                .style('font-size', '0.75em')
                                .text(d);

                            j += (d.length * 5) + 50;
                        });
                }
            };

            legend('#all-legend');
            mapped(all, '#all', 700);
            mapped(esdn, '#esdn', 500);
            mapped(mwdl, '#mwdl', 500);
            mapped(nc, '#nc', 500);

            d3.selectAll('.row').classed('hide', false);
            d3.select('#load').classed('hide', true);
        };

        render();

        window.addEventListener('resize', render);
    });
