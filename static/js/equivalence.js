
$(document).ready(function () {

	//侧边栏
	var sideBar = new StarList('star-list');

    //定义全局变量，存储返回的结果
    var Rank_Results = null;
	var student_Id;
    var g_data;

    //提交前台参数，向后台请求搜索结果


    
/*    $('#InputFileOne').click(function () {
        //var category = $('#category_shows').text();
        //var searchID = $('#input_id').val();
		//student_Id = searchID;                                                              
		
        $.getJSON("/equivalenc/"+1,
            {
                studentId: 1
            },
            function (data) {
                Rank_Results = data.Rank;
                g_data = data;
                console.log(data);
				// 更具数据画图
				eq_force.removeGraph();
                eq_force.getData("#graph_eq", data);
/*                eq_force.getData("#graph_eq", data);*/
				// 更具数据更新侧边栏
/*				var degreecentralityRank = Rank_Results[4].Degree;
				refreshStarList(sideBar, degreecentralityRank, force);*/
/*            }
        );
    });*/

    $('#afsdafsdfasdfsdafsdfsafdadfad').click(function () {
        //var category = $('#category_shows').text();
        var searchID = $('#input_id_fsdfdsfsd').val();
        student_Id = searchID;                                                              
        
        $.getJSON("/equivalenc/"+1,
            {
                studentId: student_Id
            },
            function (data) {
                // 根据数据画图
                eq_force.removeGraph();
                eq_force.getData("#graph_eq", data);

                g_data = data;
                Rank_Results = data.Rank;
                eq_force.getStructralResult(student_Id, data);
                //、、、、、、//////////////、、、、、、、、、、///、///、///、/、/、/、/、///、高亮显示搜索结果。
/*                eq_force.getData("#graph_eq", data);*/
                // 更具数据更新侧边栏
                var rankList = Rank_Results.structral;
                refreshStarList(sideBar, rankList, eq_force);
            }
        );
    });

//			  $('#degree_id').on('click',function(){
//				  console.log("degreeCentrality");
//			  });
	

    $('#structral_id').click(function (){
        var rankList = Rank_Results.structral;
        eq_force.getStructralResult(student_Id, g_data);
        refreshStarList(sideBar, rankList, eq_force);
    });

    $('#regularity_id').click(function (){
        var rankList = Rank_Results.regular;
        eq_force.getRegularResult(student_Id, g_data);
        refreshStarList(sideBar, rankList, eq_force);
    });



});
