#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2015-05-17 11:45:49
# @Author  : NSSimacer Ng
# @Email   : wuxiaoqiang1020@gmail.com
# @Link    : nssimacer.github.io
# @Version : 1.0


import os
import igraph
import networkx as nx
from flask import Flask, render_template, request, make_response
from werkzeug import secure_filename
import json
import copy

import Calculation as c
import DataProcess as dp

# 声明全局变量
data = {}
G_igraph = igraph.Graph()
G_nx = nx.Graph()
nodes_vector = []
aca_graph = ()

# 存储上传文件的位置
UPLOAD_FOLDER = '/file/'
# 允许上传的文件后缀，限制后缀为了防止 XSS 攻击
ALLOWED_EXTENSIONS = set(['txt', 'csv', 'xml'])
# 允许上传的文件最大尺寸(1MB)
MAX_FILE_SIZE = 1024 * 1024

# 创建 Flask 应用
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = app.root_path + UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE


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

    for c_dict in centrality_list:  # 计算前 N 个节点

        top_ten = sorted(c_dict.values()[0], reverse=True)[:top_n]

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


def allowed_file(filename):

    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    '''
    应用起始页面
    '''

    return render_template('main.html')


@app.route('/upload_file/', methods=['GET', 'POST'])
def upload_file():
    '''
    解析上传文件，构造图
    '''

    global G_igraph, G_nx, nodes_vector, aca_graph

    if request.method == 'POST':

        uploaded_file = request.files['file']

        if uploaded_file and allowed_file(uploaded_file.filename):

            filename = secure_filename(uploaded_file.filename)

            # 保存上传文件到服务器
            uploaded_file.save(
                os.path.join(app.config['UPLOAD_FOLDER'], filename))

            file_path = app.config['UPLOAD_FOLDER'] + uploaded_file.filename

            # 第一次遍历文件，找出编号最大的节点
            with open(file_path, 'r') as f:

                max_num = 0

                graph_nodes = []

                for line in f:

                    if line and not line.strip().startswith('#'):

                        from_node_str, to_node_str = line.rsplit(None, 1)

                        from_node = map(int, from_node_str.split(','))
                        to_node = map(int, to_node_str.split(','))

                        from_node_id = from_node[0]
                        to_node_id = to_node[0]

                        # 判断节点是否在节点集合里
                        if from_node_id not in graph_nodes:

                            graph_nodes.append(from_node_id)

                        if to_node_id not in graph_nodes:

                            graph_nodes.append(to_node_id)

                        if from_node_id > max_num or to_node_id > max_num:

                            max_num = max(from_node_id, to_node_id)

                nodes_vector = [0] * (max_num + 1)

                G_igraph.add_vertices(graph_nodes)  # 添加节点集合到图里

                f.seek(0)  # 返回文件头

                # 再次遍历文件，填充 nodes_vector，构造 G_igraph
                for line in f:

                    if line and not line.strip().startswith('#'):

                        from_node_str, to_node_str = line.rsplit(None, 1)

                        from_node = map(int, from_node_str.split(','))
                        to_node = map(int, to_node_str.split(','))

                        from_node_id = from_node[0]
                        from_node_vector = from_node[1:]

                        to_node_id = to_node[0]
                        to_node_vector = to_node[1:]

                        # 添加边
                        G_igraph.add_edge(from_node_id, to_node_id)

                        nodes_vector[from_node_id] = from_node_vector
                        nodes_vector[to_node_id] = to_node_vector

        G_nx = nx.DiGraph(G_igraph.get_edgelist())

        aca_graph = dp.separate_data_by_academy(nodes_vector, G_igraph)

    return render_template('main.html')


@app.route('/centrality/<int(min=0, max=5):req_id>', methods=['POST', 'GET'])
def top_students(req_id):
    '''
    处理名人推荐、学院搜索

    ----------
    parameter
      req_id 请求编号

    return
      前端需要的数据
    '''

    global G_igraph, G_nx, nodes_vector, aca_graph, data

    paramas = request.args  # GET 请求参数

    if req_id == 0:  # 渲染 Centrality 页面

        return render_template('new_centrality.html')

    elif req_id == 1:  # 请求全校学生节点中心度值

        ig_list = c.centrality_calculation_by_igraph(G_igraph)
        nx_list = c.centrality_calculation_by_networkx(G_nx)

        graph_json = dp.graph_json(G_nx, nodes_vector)  # 图信息

        c_list = ig_list + nx_list  # Centrality 计算结果

        # c_list = c.test(G_nx)  # 测试：只使用 networkx 进行计算

        # 对 Centrality 计算结果进行深度拷贝，用于计算 Top-N
        centrality_list = copy.deepcopy(c_list)

        top_n_list, rank_list = top_rank(
            centrality_list,
            min(10, len(G_nx.nodes())))

        data = {'Centrality': c_list,
                'Graph': graph_json,
                'Rank': rank_list}  # 封装成 dict

        return make_response(json.dumps(data))

    elif req_id == 2:  # 请求某个院学生节点中心度值

        aca_id = int(paramas['search']) - 1  # 参数：学院 ID

        ig_list = c.centrality_calculation_by_igraph(aca_graph[aca_id])
        nx_list = c.centrality_calculation_by_networkx(
            nx.DiGraph(aca_graph[aca_id].get_edgelist()))

        graph_json = dp.graph_json(
            nx.DiGraph(aca_graph[aca_id].get_edgelist()), nodes_vector)  # 图信息

        c_list = ig_list + nx_list  # Centrality 计算结果

        # c_list = c.test(G_nx)

        centrality_list = copy.deepcopy(c_list)

        top_ten_list, rank_list = top_rank(centrality_list, 10)

        print rank_list
        print top_ten_list

        data = {'Centrality': c_list,
                'Graph': graph_json,
                'Rank': rank_list}  # 封装成 dict

        return make_response(json.dumps(data))

    elif req_id == 3:  # 请求某个学生节点中心度值

        stu_id = int(paramas['search'])  # 参数：学生 ID

        ig_list = c.centrality_calculation_by_igraph(G_igraph)
        nx_list = c.centrality_calculation_by_networkx(G_nx)

        graph_json = dp.graph_json(G_nx, nodes_vector)  # 图信息

        c_list = ig_list + nx_list  # Centrality 计算结果

        # c_list = c.test(G_nx)

        centrality_list = copy.deepcopy(c_list)

        rank_list = []

        for c_dict in centrality_list:  # 构造 Rank

            c_dict[c_dict.keys()[0]] = []

            rank_list.append(c_dict)

        stu_centrality_list = []

        # 取出所有计算该节点 Centrality 算法中对应的值，并以 key-value 存储
        for centrality in c_list:

            stu_centrality = {}

            centrality_key = centrality.keys()[0]
            centrality_value = centrality.values()[0][stu_id]

            stu_centrality[centrality_key] = centrality_value

            stu_centrality_list.append(stu_centrality)

        data = {'StudentCentrality': stu_centrality_list,
                'Centrality': c_list,
                'Graph': graph_json,
                'Rank': rank_list}  # 封装成 dict

        return make_response(json.dumps(data))


@app.route('/coefficience/<int(min=0, max=5):req_id>', methods=['POST', 'GET'])
def closest_group(req_id):
    '''
    处理学院聚集度

    ----------
    parameter
      req_id 请求编号

    return
      渲染的模板
    '''

    global G_igraph, G_nx, nodes_vector, aca_graph, data

    paramas = request.args  # GET 请求参数

    if req_id == 0:  # 渲染 coefficient 页面

        return render_template('new_coefficience.html')

    elif req_id == 1:  # 选择两个学院

        # 参数：学院 ID
        aca1_id = int(paramas['acaId1']) - 1
        aca2_id = int(paramas['acaId2']) - 1

        # 分别计算两个院的 Cluster Coefficient
        aca1_graph_json = dp.graph_json(
            nx.DiGraph(aca_graph[aca1_id].get_edgelist()), nodes_vector)

        aca1_coefficient = c.cluster_coefficient_calculation(
            nx.DiGraph(
                aca_graph[aca1_id].
                get_edgelist()).to_undirected(reciprocal=False))

        aca2_graph_json = dp.graph_json(
            nx.DiGraph(aca_graph[aca2_id].get_edgelist()), nodes_vector)

        aca2_coefficient = c.cluster_coefficient_calculation(
            nx.DiGraph(
                aca_graph[aca2_id].
                get_edgelist()).to_undirected(reciprocal=False))

        # 根据请求返回需要的对应格式的数据
        data = {'AcademyGraph1': aca1_graph_json,
                'AcademyGraph2': aca2_graph_json,
                'AcademyCoefficient1': aca1_coefficient,
                'AcademyCoefficient2': aca2_coefficient}

        return make_response(json.dumps(data))


@app.route('/equivalenc/<int(min=0, max=5):req_id>', methods=['POST', 'GET'])
def student_equivalence(req_id):

    global G_igraph, G_nx, nodes_vector, data
    paramas = request.args

    if req_id == 0:

        return render_template('/new_equivalence.html')

    elif req_id == 1:
        stu_id = int(paramas['studentId'])

        graph_json = dp.graph_json(G_nx, nodes_vector)  # 图信息

        G = G_nx.to_undirected(reciprocal=False)

        matrix = nx.to_numpy_matrix(G)

        # 分别计算struct-cosine 和 regular-cosine，结果存入字典
        array1 = c.select_similar(nodes_vector, matrix, stu_id, 0)
        array2 = c.select_similar(nodes_vector, matrix, stu_id, 1)

        top_ten_list = {'structral': array1, 'regular': array2}

        data = {'Graph': graph_json,
                'Rank': top_ten_list}  # 封装成 dict

        return make_response(json.dumps(data))


def main():

    global G_igraph, G_nx, nodes_vector, aca_graph

    G_igraph, G_nx, nodes_vector = dp.generate_data()

    # TODO 读取上传文件的图信息，获得图信息 (G_igraph, G_nx) 和 nodes_vector

    aca_graph = dp.separate_data_by_academy(nodes_vector, G_igraph)


if __name__ == '__main__':

    # main()

    app.run(debug=True)
