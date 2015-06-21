#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2015-05-30 01:39:11
# @Author  : NSSimacer Ng
# @Email   : wuxiaoqiang1020@gmail.com
# @Link    : nssimacer.github.io
# @Version : 1.0


import networkx as nx
import igraph
import random
import matplotlib.pyplot as plt


def graph_json(G, nodes_vector):
    '''
    图的信息

    -----------
    parameter
      G networkx 图

    return
      图的节点、边信息
    '''

    nodes = G.nodes()
    edges = G.edges()

    nodes_list = []
    edges_list = []

    for node in nodes:  # 添加节点信息

        nodes_list.append({'id': str(node + 1),
                           'gender': nodes_vector[node][0],
                           'age': nodes_vector[node][1],
                           'academy': nodes_vector[node][2],
                           'interest': nodes_vector[node][3]})

    for edge in edges:

        edges_list.append({'source': edge[0], 'target': edge[1]})

    return {'nodes': nodes_list, 'edges': edges_list}


def separate_data_by_academy(nodes_vector, graph):
    '''
    分割子图

    -----------
    parameter
      nodes_vector 图中对应节点的 vector 属性
      graph 待分割的 networkx 图

    return
      分割后的子图
    '''

    aca0_list = []
    aca1_list = []

    for index, node_vector in enumerate(nodes_vector):

        if node_vector[2] == 0:  # 按学院划分子图

            aca0_list.append(index)

        else:

            aca1_list.append(index)

    aca0_sub_igraph = graph.subgraph(aca0_list)
    aca1_sub_igraph = graph.subgraph(aca1_list)

    return aca0_sub_igraph, aca1_sub_igraph


def generate_data():
    '''
    产生计算所需数据

    ------------
    return
      G_igraph 用于 igraph 计算的图
      G_nx 用于 networkx 计算的图
      nodes_vector 图中对应节点的 vector 属性
    '''

    N = 20

    # 由 igraph 生成的随机图
    G_igraph = igraph.Graph.GRG(N, 0.8)

    # 用于 networkx 计算的有向图
    G_nx = nx.DiGraph(G_igraph.get_edgelist())

    # 存储图中对应节点的 vector
    nodes_vector = []
    node_vector = [0] * 4

    # 初始化节点 vector 信息
    for i in xrange(N):

        node_vector[0] = random.randint(0, 1)  # 性别
        node_vector[1] = random.randint(20, 28)  # 年龄
        node_vector[2] = random.randint(0, 1)  # 学院学生数不一定是相同的
        node_vector[3] = random.randint(0, 1)  # 兴趣爱好

        nodes_vector.append(node_vector)

        node_vector = [0] * 4  # 清零 vector，否则所有 vector 都是相同的

    return G_igraph, G_nx, nodes_vector


def main():

    G_igraph, G_nx, nodes_vector = generate_data()

    aca0, aca1 = separate_data_by_academy(nodes_vector, G_nx)
    print graph_json(G_nx, nodes_vector)

    with open('sample_graph.txt', 'w') as f:

        f.write(
            '# from_node,gender,age,academy,interest\
            to_node,gender,age,academy,interest\n')

        for edge in G_igraph.get_edgelist():

            from_node = edge[0]
            to_node = edge[1]

            f.write(str(from_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[from_node]) +
                    ' ' + str(to_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[to_node]) +
                    '\n')

    with open('aca0.txt', 'w') as f:

        f.write(
            '# from_node,gender,age,academy,interest\
            to_node,gender,age,academy,interest\n')

        for edge in aca0.edges():

            from_node = edge[0]
            to_node = edge[1]

            f.write(str(from_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[from_node]) +
                    ' ' + str(to_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[to_node]) +
                    '\n')

    with open('aca1.txt', 'w') as f:

        f.write(
            '# from_node,gender,age,academy,interest\
            to_node,gender,age,academy,interest\n')

        for edge in aca1.edges():

            from_node = edge[0]
            to_node = edge[1]

            f.write(str(from_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[from_node]) +
                    ' ' + str(to_node) + ',' +
                    ','.join(str(attr) for attr in nodes_vector[to_node]) +
                    '\n')

    print 'aca0 nodes:', len(aca0.nodes()), aca0.nodes()
    print 'aca1 nodes:', len(aca1.nodes()), aca1.nodes()

    print 'aca0 nodes:', len(graph_json(aca0, nodes_vector)['nodes'])
    print 'aca1 nodes:', len(graph_json(aca1, nodes_vector)['nodes'])

    plt.subplot(121)
    nx.draw_networkx(
        G=aca0,
        pos=nx.spring_layout(aca0),
        with_labels=True,
        node_color='g',
        edge_color='b',
        alpha=1)

    plt.axis('off')

    plt.subplot(122)
    nx.draw_networkx(
        G=aca1,
        pos=nx.spring_layout(aca1),
        with_labels=True,
        node_color='g',
        edge_color='b',
        alpha=1)

    plt.axis('off')
    plt.show()


if __name__ == '__main__':

    main()
