/**
 * Created by liyp on 5/26/2015.
 */
$(document).ready(function(){
    $("p").click(function(){
        $(this).fadeOut(3000);
        //show(this);
    });

    function show(a){
        alert(a.innerHTML);
    }
});

