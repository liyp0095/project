/**
 * Created by renlinhu on 15/6/2.
 */

$(document).ready(function () {

	// 侧边栏
	var sideBar = new StarList('star-list');

    //定义全局变量，存储返回的结果
    var searchID = null;
    var Institutes_Results = null;
    var Rank_Results = null;
    var flag = 1;
    var graphShowNow = 0;      //1为学校，2为学员，3为个人

    //点击按钮更改按钮内容
    $('#school_category').click(function () {
        $('#category_shows').text("学校搜索");
        $('#input_id').attr("disabled",true);
        flag = 1;
    });

    $('#institute_category').click(function () {
        $('#category_shows').text("学院搜索");
        $('#input_id').removeAttr("disabled");
        //$('#input_id').attr("required",true);
        //$('#input_id').attr("range",[0,1]);

        flag = 2;
    });

    $('#individuals_category').click(function () {
        $('#category_shows').text("个人搜索");
        $('#input_id').removeAttr("disabled");
        flag = 3;
    });

    //提交前台参数，向后台请求搜索结果
    $('#submit_parameters').click(function () {
        //var category = $('#category_shows').text();
        searchID = $('#input_id').val();
        //console.log(category);
        //alert("/centrality/"+flag);


        $('#searchForm').validate();

        $.getJSON("/centrality/" + flag,
            {
                search: searchID
            },
            function (data) {
                Rank_Results = data.Rank;
                console.log(data);
                //console.log(School_Rank_Results);
				// 更具数据画图

                switch(flag){
                    case 1:
                        force.removeGraph();
                        force.getData(data);
                        graphShowNow = 1;
                        break;
                    case 2:
                        force.removeGraph();
                        force.getData(data);
                        graphShowNow = 2;
                        break;
                    case 3:
                        if(graphShowNow == 2 || graphShowNow == 0)
                        {
                            force.removeGraph();
                            force.getData(data);
                        }
                        force.getUsrId(searchID);
                        graphShowNow = 3;
                        break;
                    default:
                        force.removeGraph();
                        force.getData(data);
                }

				// 更具数据更新侧边栏
				var degreecentralityRank = Rank_Results[4].Degree;
				refreshStarList(sideBar, degreecentralityRank, force);
            }
        );
    });

//			  $('#degree_id').on('click',function(){
//				  console.log("degreeCentrality");
//			  });

    //显示七种centrality计算方法的返回结果
    $('#degree_id').click(function () {
        console.log("degreecentrality222");
/*        if(flag == 3) force.getUsrId(searchID);
        else */force.onDegreeCentrality();
		
		var degreecentralityRank = Rank_Results[4].Degree;
		refreshStarList(sideBar, degreecentralityRank, force);
    });

    $('#eigenvector_id').click(function () {
/*        console.log("eigenvector_id");
        if(flag == 3) force.getUsrId(searchID);
        else f*/force.onEigenvectorCentrality();
		
		var eigenvectorRank = Rank_Results[0].Eigenvector;
		refreshStarList(sideBar, eigenvectorRank, force);
    });

    $('#katz_id').click(function () {
/*        console.log("katz_id");
        if(flag == 3) force.getUsrId(searchID);
        else */force.onKatzCentrality();
		
		var katzRank = Rank_Results[5].Katz;
		refreshStarList(sideBar, katzRank, force);
    });

    $('#betweenness_id').click(function () {
/*        console.log("betweeness");
        if(flag == 3) force.getUsrId(searchID);
        else */force.onBetweennessCentrality();
		
		var betweennessRank = Rank_Results[1].Betweenness;
		refreshStarList(sideBar, betweennessRank, force);
    });

    $('#closeness_id').click(function () {
/*        console.log("closeness");
        if(flag == 3) force.getUsrId(searchID);
        else */force.onClosennessCentrality();
		
		var closenessRank = Rank_Results[2].Closeness;
		refreshStarList(sideBar, closenessRank, force);
    });

    $('#pagerank_id').click(function () {
/*        console.log("pagerank");
        if(flag == 3) force.getUsrId(searchID);
        else */force.onPageRank();
		
		var pageRank = Rank_Results[3].PageRank;
		refreshStarList(sideBar, pageRank, force);
    });

    $('#group_id').click(function () {
/*        console.log("group");
        if(flag == 3) force.getUsrId(searchID);
        else */force.onGroupCentrality();
		
		//var 
    });

    ////前后台交互
    //$("button").click(function () {
    //    $.post(URL,
    //        {
    //            category: "Donald Duck",
    //            searchID: "Duckburg"
    //        },
    //        function (data, status) {
    //            alert("Data: " + data + "nStatus: " + status);
    //        });
    //});
	
});
