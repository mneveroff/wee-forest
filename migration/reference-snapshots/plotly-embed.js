
var figure = {
    "data": [
        {
            "line": {
                "color": "rgb(234, 39, 6)",
                "shape": "spline",
                "width": 4,
                "smoothing": 1.3
            },
            "meta": {
                "columnNames": {
                    "x": "Year",
                    "y": "Native Felled Trees",
                    "text": "Native Felled Trees"
                }
            },
            "mode": "markers+lines",
            "name": "Felled Native Trees, ha",
            "type": "scatter",
            "xsrc": "espionage_busily700:2:d00ca2",
            "x": [
                "2012",
                "2013",
                "2014",
                "2015",
                "2016",
                "2017",
                "2018",
                "2019",
                "2020",
                "2021",
                "2022"
            ],
            "ysrc": "espionage_busily700:2:c01b36",
            "y": [
                "32000",
                "37000",
                "41000",
                "43000",
                "46000",
                "47000",
                "51000",
                "55000",
                "61000",
                "65000",
                "69000"
            ],
            "marker": {
                "line": {
                    "width": 2
                },
                "size": 12,
                "symbol": "circle",
                "opacity": 1
            },
            "hoveron": "points+fills",
            "textsrc": "espionage_busily700:2:c01b36",
            "text": [
                "32000",
                "37000",
                "41000",
                "43000",
                "46000",
                "47000",
                "51000",
                "55000",
                "61000",
                "65000",
                "69000"
            ],
            "visible": true,
            "fillcolor": "rgba(153,27,27, 0.3)",
            "hoverinfo": "x+y",
            "cliponaxis": false,
            "stackgroup": 1,
            "textposition": "top center"
        },
        {
            "fill": "tonexty",
            "line": {
                "shape": "spline",
                "width": 4,
                "smoothing": 1.3
            },
            "meta": {
                "columnNames": {
                    "x": "Year",
                    "y": "Felled Trees",
                    "text": "Felled Trees"
                }
            },
            "mode": "markers+lines",
            "name": "Felled Trees, ha",
            "type": "scatter",
            "xsrc": "espionage_busily700:2:d00ca2",
            "x": [
                "2012",
                "2013",
                "2014",
                "2015",
                "2016",
                "2017",
                "2018",
                "2019",
                "2020",
                "2021",
                "2022"
            ],
            "ysrc": "espionage_busily700:2:ce32fb",
            "y": [
                "165000",
                "235000",
                "290000",
                "320000",
                "350000",
                "355000",
                "390000",
                "410000",
                "460000",
                "485000",
                "520000"
            ],
            "xaxis": "x",
            "yaxis": "y",
            "marker": {
                "line": {
                    "width": 2
                },
                "size": 12,
                "symbol": "circle",
                "opacity": 1
            },
            "hoveron": "points+fills",
            "textsrc": "espionage_busily700:2:ce32fb",
            "text": [
                "165000",
                "235000",
                "290000",
                "320000",
                "350000",
                "355000",
                "390000",
                "410000",
                "460000",
                "485000",
                "520000"
            ],
            "visible": true,
            "fillcolor": "rgba(185, 28, 28, 0.05)",
            "hoverinfo": "x+y",
            "cliponaxis": false,
            "hoverlabel": {
                "align": "auto",
                "namelength": 0
            },
            "stackgroup": 1,
            "connectgaps": false,
            "textposition": "top center",
            "hovertemplate": ""
        }
    ],
    "layout": {
        "title": {
            "font": {
                "size": 18
            }
        },
        "xaxis": {
            "side": "bottom",
            "type": "linear",
            "dtick": 1,
            "range": [
                2012,
                2022
            ],
            "tick0": 0,
            "ticks": "",
            "title": {
                "font": {
                    "size": 10
                }
            },
            "nticks": 8,
            "showgrid": false,
            "showline": false,
            "tickfont": {
                "size": 12
            },
            "tickmode": "auto",
            "zeroline": false,
            "autorange": true,
            "gridcolor": "rgb(255, 255, 255)",
            "gridwidth": 1,
            "linewidth": 6,
            "automargin": true,
            "showspikes": false,
            "tickformat": "",
            "rangeslider": {
                "range": [
                    2012,
                    2022
                ],
                "yaxis": {},
                "yaxis2": {},
                "visible": false,
                "autorange": true
            },
            "showexponent": "all",
            "zerolinewidth": 12,
            "showticklabels": true,
            "separatethousands": false
        },
        "yaxis": {
            "side": "right",
            "type": "linear",
            "range": [
                0,
                623985.6004114168
            ],
            "ticks": "inside",
            "title": {
                "font": {
                    "size": 10
                }
            },
            "nticks": 7,
            "ticklen": 12,
            "showgrid": true,
            "autorange": true,
            "gridcolor": "rgba(207, 218, 232, 0.2)",
            "gridwidth": 0,
            "tickwidth": 2,
            "showspikes": false,
            "showexponent": "all",
            "showticklabels": true,
            "separatethousands": false
        },
        "legend": {
            "x": -0.0007493146512336672,
            "y": 0.9574271844660194,
            "font": {
                "size": 14
            },
            "title": {
                "font": {
                    "size": 1
                },
                "text": "<br>"
            },
            "xanchor": "auto",
            "yanchor": "auto",
            "orientation": "v"
        },
        "margin": {
            "b": 30,
            "l": 0,
            "r": 0,
            "t": 10,
            "pad": 0
        },
        "autosize": true,
        "dragmode": "zoom",
        "template": {
            "data": {
                "bar": [
                    {
                        "type": "bar",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "table": [
                    {
                        "type": "table",
                        "cells": {
                            "fill": {
                                "color": "#EBF0F8"
                            },
                            "line": {
                                "color": "white"
                            }
                        },
                        "header": {
                            "fill": {
                                "color": "#C8D4E3"
                            },
                            "line": {
                                "color": "white"
                            }
                        }
                    }
                ],
                "carpet": [
                    {
                        "type": "carpet",
                        "aaxis": {
                            "gridcolor": "#C8D4E3",
                            "linecolor": "#C8D4E3",
                            "endlinecolor": "#2a3f5f",
                            "minorgridcolor": "#C8D4E3",
                            "startlinecolor": "#2a3f5f"
                        },
                        "baxis": {
                            "gridcolor": "#C8D4E3",
                            "linecolor": "#C8D4E3",
                            "endlinecolor": "#2a3f5f",
                            "minorgridcolor": "#C8D4E3",
                            "startlinecolor": "#2a3f5f"
                        }
                    }
                ],
                "mesh3d": [
                    {
                        "type": "mesh3d",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        }
                    }
                ],
                "contour": [
                    {
                        "type": "contour",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        },
                        "autocolorscale": true
                    }
                ],
                "heatmap": [
                    {
                        "type": "heatmap",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        },
                        "autocolorscale": true
                    }
                ],
                "scatter": [
                    {
                        "type": "scatter",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "surface": [
                    {
                        "type": "surface",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        }
                    }
                ],
                "heatmapgl": [
                    {
                        "type": "heatmapgl",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        }
                    }
                ],
                "histogram": [
                    {
                        "type": "histogram",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "parcoords": [
                    {
                        "line": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        },
                        "type": "parcoords"
                    }
                ],
                "scatter3d": [
                    {
                        "type": "scatter3d",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "scattergl": [
                    {
                        "type": "scattergl",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "choropleth": [
                    {
                        "type": "choropleth",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        }
                    }
                ],
                "scattergeo": [
                    {
                        "type": "scattergeo",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "histogram2d": [
                    {
                        "type": "histogram2d",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        },
                        "autocolorscale": true
                    }
                ],
                "scatterpolar": [
                    {
                        "type": "scatterpolar",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "contourcarpet": [
                    {
                        "type": "contourcarpet",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        }
                    }
                ],
                "scattercarpet": [
                    {
                        "type": "scattercarpet",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "scattermapbox": [
                    {
                        "type": "scattermapbox",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "scatterpolargl": [
                    {
                        "type": "scatterpolargl",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "scatterternary": [
                    {
                        "type": "scatterternary",
                        "marker": {
                            "colorbar": {
                                "ticks": "",
                                "outlinewidth": 0
                            }
                        }
                    }
                ],
                "histogram2dcontour": [
                    {
                        "type": "histogram2dcontour",
                        "colorbar": {
                            "ticks": "",
                            "outlinewidth": 0
                        },
                        "autocolorscale": true
                    }
                ]
            },
            "layout": {
                "geo": {
                    "bgcolor": "white",
                    "showland": true,
                    "lakecolor": "white",
                    "landcolor": "white",
                    "showlakes": true,
                    "subunitcolor": "#C8D4E3"
                },
                "font": {
                    "color": "#2a3f5f"
                },
                "polar": {
                    "bgcolor": "white",
                    "radialaxis": {
                        "ticks": "",
                        "gridcolor": "#EBF0F8",
                        "linecolor": "#EBF0F8"
                    },
                    "angularaxis": {
                        "ticks": "",
                        "gridcolor": "#EBF0F8",
                        "linecolor": "#EBF0F8"
                    }
                },
                "scene": {
                    "xaxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "gridwidth": 2,
                        "linecolor": "#EBF0F8",
                        "zerolinecolor": "#EBF0F8",
                        "showbackground": true,
                        "backgroundcolor": "white"
                    },
                    "yaxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "gridwidth": 2,
                        "linecolor": "#EBF0F8",
                        "zerolinecolor": "#EBF0F8",
                        "showbackground": true,
                        "backgroundcolor": "white"
                    },
                    "zaxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "gridwidth": 2,
                        "linecolor": "#EBF0F8",
                        "zerolinecolor": "#EBF0F8",
                        "showbackground": true,
                        "backgroundcolor": "white"
                    }
                },
                "title": {
                    "x": 0.05
                },
                "xaxis": {
                    "ticks": "",
                    "gridcolor": "#EBF0F8",
                    "linecolor": "#EBF0F8",
                    "automargin": true,
                    "zerolinecolor": "#EBF0F8",
                    "zerolinewidth": 2
                },
                "yaxis": {
                    "ticks": "",
                    "gridcolor": "#EBF0F8",
                    "linecolor": "#EBF0F8",
                    "automargin": true,
                    "zerolinecolor": "#EBF0F8",
                    "zerolinewidth": 2
                },
                "ternary": {
                    "aaxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "linecolor": "#A2B1C6"
                    },
                    "baxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "linecolor": "#A2B1C6"
                    },
                    "caxis": {
                        "ticks": "",
                        "gridcolor": "#DFE8F3",
                        "linecolor": "#A2B1C6"
                    },
                    "bgcolor": "white"
                },
                "colorway": [
                    "#636efa",
                    "#EF553B",
                    "#00cc96",
                    "#ab63fa",
                    "#19d3f3",
                    "#e763fa",
                    "#fecb52",
                    "#ffa15a",
                    "#ff6692",
                    "#b6e880"
                ],
                "hovermode": "closest",
                "colorscale": {
                    "diverging": [
                        [
                            0,
                            "#8e0152"
                        ],
                        [
                            0.1,
                            "#c51b7d"
                        ],
                        [
                            0.2,
                            "#de77ae"
                        ],
                        [
                            0.3,
                            "#f1b6da"
                        ],
                        [
                            0.4,
                            "#fde0ef"
                        ],
                        [
                            0.5,
                            "#f7f7f7"
                        ],
                        [
                            0.6,
                            "#e6f5d0"
                        ],
                        [
                            0.7,
                            "#b8e186"
                        ],
                        [
                            0.8,
                            "#7fbc41"
                        ],
                        [
                            0.9,
                            "#4d9221"
                        ],
                        [
                            1,
                            "#276419"
                        ]
                    ],
                    "sequential": [
                        [
                            0,
                            "#0508b8"
                        ],
                        [
                            0.0893854748603352,
                            "#1910d8"
                        ],
                        [
                            0.1787709497206704,
                            "#3c19f0"
                        ],
                        [
                            0.2681564245810056,
                            "#6b1cfb"
                        ],
                        [
                            0.3575418994413408,
                            "#981cfd"
                        ],
                        [
                            0.44692737430167595,
                            "#bf1cfd"
                        ],
                        [
                            0.5363128491620112,
                            "#dd2bfd"
                        ],
                        [
                            0.6256983240223464,
                            "#f246fe"
                        ],
                        [
                            0.7150837988826816,
                            "#fc67fd"
                        ],
                        [
                            0.8044692737430168,
                            "#fe88fc"
                        ],
                        [
                            0.8938547486033519,
                            "#fea5fd"
                        ],
                        [
                            0.9832402234636871,
                            "#febefe"
                        ],
                        [
                            1,
                            "#fec3fe"
                        ]
                    ],
                    "sequentialminus": [
                        [
                            0,
                            "#0508b8"
                        ],
                        [
                            0.0893854748603352,
                            "#1910d8"
                        ],
                        [
                            0.1787709497206704,
                            "#3c19f0"
                        ],
                        [
                            0.2681564245810056,
                            "#6b1cfb"
                        ],
                        [
                            0.3575418994413408,
                            "#981cfd"
                        ],
                        [
                            0.44692737430167595,
                            "#bf1cfd"
                        ],
                        [
                            0.5363128491620112,
                            "#dd2bfd"
                        ],
                        [
                            0.6256983240223464,
                            "#f246fe"
                        ],
                        [
                            0.7150837988826816,
                            "#fc67fd"
                        ],
                        [
                            0.8044692737430168,
                            "#fe88fc"
                        ],
                        [
                            0.8938547486033519,
                            "#fea5fd"
                        ],
                        [
                            0.9832402234636871,
                            "#febefe"
                        ],
                        [
                            1,
                            "#fec3fe"
                        ]
                    ]
                },
                "plot_bgcolor": "white",
                "paper_bgcolor": "white",
                "shapedefaults": {
                    "line": {
                        "width": 0
                    },
                    "opacity": 0.4,
                    "fillcolor": "#506784"
                },
                "annotationdefaults": {
                    "arrowhead": 0,
                    "arrowcolor": "#506784",
                    "arrowwidth": 1
                }
            },
            "themeRef": "PLOTLY_WHITE"
        },
        "hovermode": "x",
        "showlegend": true
    },
    "frames": []
}
