#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2015-05-17 11:45:49
# @Author  : NSSimacer Ng
# @Email   : wuxiaoqiang1020@gmail.com
# @Link    : nssimacer.github.io
# @Version : 1.0


import igraph
import networkx as nx
from flask import Flask, render_template
import json

import Calculation as c

app = Flask(__name__)


@app.route('/')
def show():

    data = preparing_data()

    return render_template(
        'main.html',
        data=json.dumps(data))


def graph_json(G):

    nodes = G.nodes()
    edges = G.edges()

    nodes_list = []
    edges_list = []

    for node in nodes:

        nodes_list.append({'id': str(node + 1)})

    for edge in edges:

        edges_list.append({'source': edge[0] + 1, 'target': edge[1] + 1})

    return {'nodes': nodes_list, 'edges': edges_list}


def preparing_data():

    # 由 igraph 生成的随机图
    G = igraph.Graph.Erdos_Renyi(n=10, m=40)

    # 使用 igraph 计算 centrality(closeness, betweenness, page rank, eigenvector)
    ig_list = c.centrality_calculation_by_igraph(G)

    # 用于 networkx 计算的有向图
    G = nx.DiGraph(G.get_edgelist())

    # 图的信息(节点与边)
    graph = graph_json(G)

    # 节点的出度、入度信息
    nodes_indegree = G.in_degree()
    nodes_outdegree = G.out_degree()

    # 使用 networkx 计算 centrality(degree, katz)
    nx_list = c.centrality_calculation_by_networkx(
        G)

    # 用于 cluster coefficient 计算的无向图
    G = G.to_undirected(reciprocal=False)

    # 计算 cluster coefficient
    cluster_coefficient = c.cluster_coefficient_calculation(G)

    # 用于计算 equivalence 的矩阵
    matrix = nx.to_numpy_matrix(G)

    # 计算 equivalence
    regular_equivalence = c.regular_equivalence(matrix)

    centrality_list = ig_list + nx_list

    data = {'Centrality': centrality_list,
            'Graph': graph,
            'Indegree': nodes_indegree,
            'Outdegree': nodes_outdegree,
            'Equivalence': regular_equivalence,
            'ClusterCoefficient': cluster_coefficient}

    return data

if __name__ == '__main__':

    app.run(debug=True)

    print preparing_data()
