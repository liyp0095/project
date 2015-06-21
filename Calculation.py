#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2015-04-25 20:44:43
# @Author  : NSSimacer Ng
# @Email   : wuxiaoqiang1020@gmail.com
# @Link    : nssimacer.github.io
# @Version : 1.0


import igraph
import networkx as nx
import numpy as np
import random
import math
import copy

import DataProcess as dp


nodes_vector = []


def top_rank(centrality_list, top_n):
    '''
    计算 Top-N 学生的排名

    -----------
    parameter
      centrality_list centrality 列表
      top_n 需要计算的前 N 名

    return
      rank_list Top-N 排名节点信息(vector)列表
    '''

    global nodes_vector

    top_ten_list = []
    top_ten_vector_list = []

    rank_list = []

    for c_dict in centrality_list:  # 计算前十个节点

        top_ten = sorted(c_dict.values()[0], reverse=True)[:top_n]

        print top_ten

        each_top_ten_list = []

        each_ten_vector_list = []

        for item in top_ten:

            for index in xrange(len(c_dict.values()[0])):

                # 计算排名前 Top-N 的节点 vector ，并将 id 加入 vector 最前面
                if item == c_dict.values()[0][index]:

                    # 判断 id 是否已经加入，因为有些节点 centrality 值相等
                    if nodes_vector[index][0] != index:

                        nodes_vector[index].insert(0, index)

                    elif nodes_vector[index][0] == index and \
                            len(nodes_vector[index]) == 4:

                        nodes_vector[index].insert(0, index)

                    each_top_ten_list.append(index)
                    each_ten_vector_list.append(
                        nodes_vector[index])

                    c_dict.values()[0][index] = 9999

        # 将排序的新值赋值给对应的 key
        c_dict[c_dict.keys()[0]] = each_ten_vector_list[:top_n]

        rank_list.append(c_dict)

        top_ten_list.append(each_top_ten_list[:top_n])
        top_ten_vector_list.append(each_ten_vector_list[:top_n])

    return top_ten_list, rank_list


def group_centrality(matrix):

    N = len(matrix)

    # 随机选取一个顶点
    vertex = random.randint(0, N - 30)

    # 随机确定 group 的大小
    number = random.randint(10, 30)

    # 存储 group 的所有结点
    selectver = []

    # 存储除 group 外的所有结点
    remainver = []

    # 将选取结点放入group
    selectver.append(vertex)

    # 该循环找到一个 group，根据选取的结点，依次将该结点的邻居加入 group
    # 再将结点的邻居的邻居加入 group，直到 group 大小为 number
    for i in xrange(1, number):

        flag = False

        for j in xrange(N):

            if matrix[vertex][j] == 1:

                if j not in selectver:

                    selectver.append(j)

            if len(selectver) == number:

                flag = True

                break

        if flag:

            break

        vertex = selectver[i]

    # 将除 group 以外的所有结点放入 list：remainver 中
    for i in xrange(N):

        flag1 = True

        for j in xrange(len(selectver)):

            if i == selectver[j]:

                flag1 = False

                break

        if flag1:

            remainver.append(i)

    sum = 0

    # 计算 group centrality：即 group 外的结点与 group 内的结点相连的个数
    for i in xrange(len(remainver)):

        t1 = remainver[i]

        flag2 = False

        for j in xrange(len(selectver)):

            t2 = selectver[j]

            if matrix[t1][t2] == 1:

                flag2 = True

                break

        if flag2:

            sum = sum + 1

    return [{'GroupDegree': [sum, selectver]}]


def regular_equivalence(matrix):

    N = len(matrix)

    eigen_value, eigen_vectors = np.linalg.eig(matrix)

    alpha = round(1.0 / eigen_value[0], 1)

    matrix = (np.eye(N, N) - np.dot(matrix, alpha)).I

    array = matrix.tolist()

    for i in xrange(len(array)):

        for j in xrange(len(array[i])):

            array[i][j] = round(array[i][j], 4)

    return array


def structural_equivalence(matrix, m):

    row_num = len(matrix)

    adj = [0] * row_num

    for i in xrange(row_num):

        col_num = len(matrix[i])

        for j in xrange(col_num):

            adj[i] += matrix[i][j]

        adj[i] /= row_num

    col_num = len(matrix[m])

    array = [0 for col in xrange(col_num)]

    for j in xrange(col_num):

        sig = 0.0
        v1 = 0.0
        v2 = 0.0
        v = 0.0

        for k in xrange(row_num):

            sig += (matrix[m][k] - adj[m]) * (matrix[j][k] - adj[j])
            v1 += (matrix[m][k] - adj[m]) ** 2
            v2 += (matrix[j][k] - adj[j]) ** 2

        v = (v1 * v2) ** 0.5

        tmp = 0

        if v != 0.0:

            tmp = sig / v

        array[j] = round(tmp, 4)

    return array


def cosine(nodes_vector, m):

    # 根据个体的属性信息计算该个体与其他个体的余弦相似度

    N = len(nodes_vector)
    M = len(nodes_vector[0])
    array = [0] * N

    for j in xrange(N):

        node_vector1 = nodes_vector[m]
        node_vector2 = nodes_vector[j]

        psum = sum([node_vector1[k] * node_vector2[k] for k in xrange(M)])
        sum1 = sum([pow(node_vector1[k], 2) for k in xrange(M)])
        sum2 = sum([pow(node_vector2[k], 2) for k in xrange(M)])
        den = math.sqrt(sum1 * sum2)

        if den == 0:

            return 0

        array[j] = float(psum) / den

    return array


def structral_cosine(nodes_vector, matrix, m):

    # 相似度计算公式：a * structral equivalence + b * cosine similarity

    array1 = cosine(nodes_vector, m)
    array2 = structural_equivalence(matrix.tolist(), m)

    a = 0.5
    b = 0.5

    N = len(matrix)

    array = [0 for col in xrange(N)]

    for j in xrange(N):

        array[j] = a * array1[j] + b * array2[j]
        array[j] = round(array[j], 4)

    return array


def regular_cosine(nodes_vector, matrix, m):

    # 相似度计算公式：a * regular equivalence + b * cosine similarity

    array1 = cosine(nodes_vector, m)
    array2 = regular_equivalence(matrix)

    a = 0.5
    b = 0.5

    N = len(nodes_vector)

    array = [0 for col in xrange(N)]

    for j in xrange(N):

        array[j] = a * array1[j] + b * array2[m][j]
        array[j] = round(array[j], 4)

    return array


def select_similar(nodes_vector, matrix, m, n):

    # 计算与结点m最相似的十个结点（除去结点m自身）
    # 输出十个结点的 id, gender, age, academy, interest, similarity
    # n = 0, 代表使用 a * structral equivalence + b * cosine similarity

    if n == 0:

        array3 = structral_cosine(nodes_vector, matrix, m)

    # n=1,代表使用 a * regular equivalence + b * cosine similarity

    else:

        array3 = regular_cosine(nodes_vector, matrix, m)

    N = len(array3)
    sum = 0
    array5 = [[0] * 6 for col in xrange(10)]

    for i in xrange(N):

        k = i

        for j in xrange(i + 1, N):

            if array3[j] > array3[k]:

                k = j

        if k != i:

            temp = array3[k]
            array3[k] = array3[i]
            array3[i] = temp

        # 结果集中不包含m结点自身
        if k != m:

            array5[sum] = [k, nodes_vector[k][0], nodes_vector[k][1],
                           nodes_vector[k][2], nodes_vector[k][3], array3[i]]
            sum += 1

        if sum == 10:

            break

    return array5


def cluster_coefficient_calculation(G):
    ''''
    使用 networkx 计算 Cluster Coefficient
    '''

    c_c = nx.average_clustering(G)

    return round(c_c, 4)


def test(G):

    d_c = nx.degree_centrality(G)

    e_v = nx.eigenvector_centrality(G=G, max_iter=1000, tol=1.0e-6)

    k_z = nx.katz_centrality(
        G=G,
        alpha=0.3,
        beta=0.3,
        max_iter=1000,
        tol=1.0e-6,
        nstart=None,
        normalized=True)

    p_k = nx.pagerank(G=G, alpha=0.3, personalization=None, max_iter=100,
                      tol=1.0e-6, nstart=None, weight='weight', dangling=None)

    b_c = nx.betweenness_centrality(G=G, k=None, normalized=True,
                                    weight=None, endpoints=False, seed=None)

    c_c = nx.closeness_centrality(G=G, u=None, distance=None, normalized=True)

    d_c = [round(1.0 * item / max(d_c), 4) for item in d_c]
    k_z = [round(1.0 * item / max(k_z), 4) for item in k_z]
    e_v = [round(1.0 * item / max(e_v), 4) for item in e_v]
    b_c = [round(1.0 * item / max(b_c), 4) for item in b_c]
    c_c = [round(1.0 * item / max(c_c), 4) for item in c_c]
    p_k = [round(1.0 * item / max(p_k), 4) for item in p_k]

    return [{'Eigenvector': e_v},
            {'Betweenness': b_c},
            {'Closeness': c_c},
            {'PageRank': p_k},
            {'Degree': d_c},
            {'Katz': k_z}]


def centrality_calculation_by_networkx(G):
    '''
    使用 networkx 计算 Centrality
    '''

    d_c = nx.degree_centrality(G)

    k_z = nx.katz_centrality(
        G=G,
        alpha=0.3,
        beta=0.3,
        max_iter=1000,
        tol=1.0e-6,
        nstart=None,
        normalized=True)

    # 归一化，每个元素除以集合中最大元素
    max_item = max([d_c[item] for item in d_c])
    degree_centrality = [round(d_c[item] / max_item, 4) for item in d_c]

    max_item = max([k_z[item] for item in k_z])
    katz_centrality = [round(k_z[item] / max_item, 4) for item in k_z]

    nx_list = [{'Degree': degree_centrality}, {'Katz': katz_centrality}]

    return nx_list


def centrality_calculation_by_igraph(G):
    '''
    使用 igraph 计算 Centrality
    '''

    e_c = G.evcent(directed=True, scale=True)
    b_c = G.betweenness(vertices=None, directed=True, cutoff=2)
    c_c = G.closeness(vertices=None, mode=igraph.ALL, cutoff=2)
    p_r = G.pagerank(vertices=None, directed=True, damping=0.85,
                     implementation='prpack', niter=1000, eps=0.001)

    # 归一化，每个元素除以集合中最大元素
    eigenvector_centrality = [round(item / max(e_c), 4) for item in e_c]
    betweenness_centrality = [round(item / max(b_c), 4) for item in b_c]
    closeness_centrality = [round(item / max(c_c), 4) for item in c_c]
    pagerank = [round(item / max(p_r), 4) for item in p_r]

    ig_list = [{'Eigenvector': eigenvector_centrality},
               {'Betweenness': betweenness_centrality},
               {'Closeness': closeness_centrality},
               {'PageRank': pagerank}]

    return ig_list


def main():

    global nodes_vector

    G_igraph, G_nx, nodes_vector = dp.generate_data()
    # G = igraph.Graph.Erdos_Renyi(n=200, p=0.08)
    # aca_graph = dp.separate_data_by_academy(nodes_vector, G_igraph)

    ig_list = centrality_calculation_by_igraph(G_igraph)
    nx_list = centrality_calculation_by_networkx(
        nx.DiGraph(G_igraph.get_edgelist()))

    c_list = ig_list + nx_list  # Centrality 计算结果
    centrality_list = copy.deepcopy(c_list)

    print centrality_list

    top_ten_list, rank_list = top_rank(centrality_list, 10)

    print rank_list
    print top_ten_list


if __name__ == '__main__':

    main()
