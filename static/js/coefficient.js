/**
 * Created by renlinhu on 15/6/3.
 */


 $(document).ready(function () {

                //点击按钮，更换下拉按钮内容
                $('#cs_institute_one').click(function () {
                    $('#Institute_one').text("计算机学院");
                });
                $('#ee_institute_one').click(function () {
                    $('#Institute_one').text("电子学院");
                });
                $('#cs_institute_two').click(function () {
                    $('#Institute_two').text("计算机学院");
                });
                $('#ee_institute_two').click(function () {
                    $('#Institute_two').text("电子学院");
                });

                //获取数据
                $('#submit_coefficience').click(function () {
                    var institute_one = getInstitute($('#Institute_one').text());
                    var institute_two = getInstitute($('#Institute_two').text());


                    $.getJSON("/coefficience/1",
                            {
                                acaId1: institute_one,
                                acaId2: institute_two
                            },
                            function (data) {
                                console.log(data);
                                co_force1.removeGraph();
                                co_force1.getData(1, "#graph_one", data);
                                co_force2.getData(2, "#graph_two", data);
                                setCoefficient(data.AcademyCoefficient1, data.AcademyCoefficient2);
                            }
                    );
                });

                function setCoefficient(c1,c2){
                    $('#coefficient_one').text(c1);
                    $('#coefficient_two').text(c2);
                }

                function getInstitute(i){
                    switch (i){
                        case "计算机学院":
                            return 1;
                            break;
                        case "电子学院":
                            return 2;
                            break;
                    }
                }


            });
