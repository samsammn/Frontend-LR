// let staffID = localStorage.getItem('sid')

$(document).ready(function(){


    $('#leave-type').load('http://localhost:5000/getLeaveType', function(response){
        $.each(JSON.parse(response), function(index, value){
            $('#leave-type').append('<option value='+value.id_leave+'>'+value.leavename+'</option>')
        });
    });

    $('#submitRequest').click(function(){
        let dataRequest = {
            sid: staffID,
            comment: $('#remarks').val(),
            sdate: $('#stdate').val(),
            edate: $('#endate').val(),
            leave_type: $('#leave-type').val(),
            submission_date: $('#submission_date').val()
        }

        $.ajax({
            url: 'http://localhost:5000/submitToSupervisor',
            type: 'POST',
            data: JSON.stringify(dataRequest),
            contentType: 'application/json',
            beforeSend: function(){
                $("#loading").show();
            },
            complete: function(msg){
                $("#loading").hide();
                console.log(msg)
            }
        })

    });

    $('#submitApproval').click(function(){
        
        let leave_id = document.location.href.split("=")[1].split("&")[0];
        let record_id = document.location.href.split("=")[2].split("&")[0];
        let process_id = document.location.href.split("=")[3].split("&")[0];

        let dataApproval = {
            lid: leave_id,
            sid: staffID,
            pid: process_id,
            rid: record_id,
            comment: $('#remarks_approval').val(),
            leaveAction: $('#leave_action').val(),
            submission_date: $('#approval_date').val()
        }

        $.ajax({
            url: 'http://localhost:5000/submitToStaff',
            type: 'POST',
            data: JSON.stringify(dataApproval),
            contentType: 'application/json',
            beforeSend: function(){
                $("#loading").show();
            },
            complete: function(msg){
                $("#loading").hide();
                console.log(msg)
            }
        })

    });

    $('#leave-type').change(function(){
        id_leave_type = $('#leave-type').val();
        $('#endate').val('')

        $.ajax({
            url: 'http://localhost:5000/getLeaveTypeBy/'+id_leave_type,
            type: 'GET',
            complete: function(msg){
                data = msg.responseJSON

                type = data[0]['typeleave'];
                days = data[0]['entitlements']

                $('#number-days').val(days)
                $('#typeLeave').val(type)

                if (type == 'Important'){
                    $('#endate').attr('disabled','disabled')
                } else {
                    $('#endate').removeAttr('disabled')
                }
            }
        })
    })

});

function logout(){
    localStorage.clear();
    window.location = 'index.html';
}

function getTasklistSupervisor(){

    $("#loading").hide();

    $.ajax({
        url:'http://localhost:5000/getTasklistSupervisor',
        type: 'POST',
        method:'POST',
        data: JSON.stringify({sid: "2018112002"}),
        contentType: 'application/json',
        beforeSend: function(){
            $("#loading").show();
        },
        complete: function(msg){
            let taskList = msg.responseJSON
            let jmlNotif = (msg.responseJSON['length']);

            console.log(taskList)

            $("#loading").hide();
            
            if (jmlNotif > 0){
                $('#countNotif').show();
                $('#countNotif').text(jmlNotif)
                
                dataNotif = (msg.responseJSON)
                $.each(dataNotif, function(val){
                    $('#notifs')
                        .append(`
                            <div class='item'>
                                <b>${dataNotif[val]['staff_name']}</b>
                                <p>${dataNotif[val]['staff_id']}</p>
                            </div>
                        `);
                });

                let nom=1;
                $.each(taskList, function(data){
                    $('#tasklist-approver-pending').append(`
                        <tr class='top aligned'>
                            <td align='center'>${nom}</td>
                            <td>${taskList[data]['staff_id']}</td>
                            <td>${taskList[data]['staff_name']}</td>
                            <td>${taskList[data]['sdate']} - ${taskList[data]['edate']}</td>
                            <td width='30%'>${taskList[data]['leave_type']}</td>
                            <td>${taskList[data]['submission_date']}</td>
                            <td><a href='leave_detail.html?lid=${taskList[data]['id']}&rid=${taskList[data]['record_id']}&pid=${taskList[data]['process_id']}' class='ui compact teal labeled icon button'><i class="pencil alternate icon"></i>Detail</td>
                        </tr>
                    `)
                    nom++;
                })

            } else {
                $('#countNotif').hide();
                $('#notifs')
                    .append(`
                        <div class='item'>Does not Notif</div>
                    `);
            }

            let no=1;
            $.each(taskList, function(data){
                $('#tasklist-approver-complete').append(`
                    <tr class='top aligned'>
                        <td align='center'>${no}</td>
                        <td>${taskList[data]['staff_id']}</td>
                        <td>${taskList[data]['staff_name']}</td>
                        <td>${taskList[data]['sdate']} - ${taskList[data]['edate']}</td>
                        <td width='30%'>${taskList[data]['leave_type']}</td>
                        <td>${taskList[data]['submission_date']}</td>
                        <td><a href='leave_detail.html?sid=${taskList[data]['staff_id']}'>Detail</td>
                    </tr>
                `)
                no++;
            })

        }
    });
}

function getDataEmplayee(staffid){

    let create_tgl = new Date();
    let tgl = create_tgl.getDate()+'/'+create_tgl.getMonth()+'/'+create_tgl.getFullYear()

    $.getJSON('http://localhost:5000/getDataEmployee/'+staffid, function(responses){

        $('#submission_date').val(tgl)

        let data = responses[0]
        $.each(data, function(value){
            $('#'+value).val(data[value])
        });

    });
}

function getDataProfile(staffid){
    $.getJSON('http://localhost:5000/getDataEmployee/'+staffid, function(responses){

        let data = responses[0]
        $('#staff_name').text(data['staffname'])
        $('#staff_id').text(data['staffid'])

    });
}

function getLeaveDetail(lid){

    let create_tgl = new Date();
    let tgl = create_tgl.getFullYear()+'/'+create_tgl.getMonth()+'/'+create_tgl.getDate()

    $.getJSON('http://localhost:5000/getLeaveDetail/'+lid, function(responses){

        $('#approval_date').val(tgl)

        let data = responses[0]
        $.each(data, function(value){
            $('#'+value).val(data[value])
        });

        // console.log(data)
        $('#numberdays').val(datediff(data['startdate'],data['enddate']))

    });
}

function datediff(sdate,edate){
    let oneDay = 24*60*60*1000;
    let startDate = new Date(sdate);
    let endDate = new Date(edate);

    let diffDays = Math.round(Math.round((endDate.getTime() - startDate.getTime()) / (oneDay)));
    return (diffDays+1);
}

function calcBusinessDays(start, end) {
    // This makes no effort to account for holidays
    // Counts end day, does not count start day

    // make copies we can normalize without changing passed in objects    
    var start = new Date(start);
    var end = new Date(end);

    // initial total
    var totalBusinessDays = 0;

    // normalize both start and end to beginning of the day
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    var current = new Date(start);
    current.setDate(current.getDate() + 1);
    var day;
    // loop through each day, checking
    while (current <= end) {
        day = current.getDay();
        if (day >= 1 && day <= 5) {
            ++totalBusinessDays;
        }
        current.setDate(current.getDate() + 1);
    }
    return (totalBusinessDays+1);
}

function getRecapitulation(){

    $.ajax({        
        url:'http://localhost:5000/getTasklistSupervisor',
        type: 'POST',
        method:'POST',
        data: JSON.stringify({sid: "2018112002"}),
        contentType: 'application/json',
        complete: function(msg){

            let dataRecap = []
            let response = msg.responseJSON

            $.each(response, function(isi){
                dataRecap.push({
                    'title': response[isi]['staff_name']+' \n '+response[isi]['leave_type'],
                    'start': response[isi]['sdate'],
                    'end': response[isi]['edate']
                })
            })

            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                },
                events: dataRecap
            })

            console.log("data recap",dataRecap)
        }
    })
    // console.log("ini recap",dataRecap)

}
