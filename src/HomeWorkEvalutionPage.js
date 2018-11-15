
import React, { Component } from 'react';
import LoginPage from './LoginPage';
import { FormErrors } from './FormErrors';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import CryptoJS from 'crypto-js';
import EmployeeMenuHeader from './EmployeeMenuHeader';
import registerServiceWorker from './registerServiceWorker';
import NoAttendanceRequest from './NoAttendanceRequest';
import EmployeeMenuPage from './EmployeeMenuPage';

import FooterText from './FooterText';
import { isFunction } from 'util';
import HomeWorkStudentMenuPage from './HomeWorkStudentMenuPage';
import HomeWorkPageStudent from './HomeWorkPageStudent';
import Calendar from './Calendar';
import AddHomeWork1 from './AddHomeWork';
import ClassHistory from './ClassHistory';
import HomeWorkPageTeacherMenu from './HomeWorkPageTeacherMenu';

var array = [];
class HomeWorkEvaluationPage extends Component {

    constructor() {
        super()

        var employeeId = CryptoJS.AES.decrypt(localStorage.getItem('EmployeeId'), "shinchanbaby").toString(CryptoJS.enc.Utf8);
        this.state = {
            date: '',
            submittedDate: '',
            subjectName: '',
            description: '',
            companyId: '',
            employeeId: employeeId,
            type: '',
            completionDate: '',
            status: '',
        };
    }

    Request() {

        var companyId = CryptoJS.AES.decrypt(localStorage.getItem('CompanyId'), "shinchanbaby").toString(CryptoJS.enc.Utf8)
        var employeeId = CryptoJS.AES.decrypt(localStorage.getItem('EmployeeId'), "shinchanbaby").toString(CryptoJS.enc.Utf8)
        this.state.companyId = companyId;
        this.state.employeeId = employeeId;
        this.setState({
            companyId: companyId,
            employeeId: employeeId,

        });
        var self = this;
        $.ajax({
            type: 'POST',
            data: JSON.stringify({
                reportingManagerId: this.state.employeeId,
                companyId: this.state.companyId,
            }),
            url: "https://wildfly.tictoks.com:443/EmployeeAttendenceAPI/HomeWork/HomeWorkDetailsRetrive",
            contentType: "application/json",
            dataType: 'json',
            async: false,
            success: function (data, textStatus, jqXHR) {
                console.log("res", data);
                if (data.homeRetrieveList.length != 0) {
                    var tab = '<thead><tr class="headcolor"  class="headcolor" style="color: white; background-color: #486885;" ><th></th><th>Id</th><th>Name</th><th>Subject Name</th><th>Type</th><th>Description</th><th>Due Date</th><th>Submitted On</th><th>Status</th></tr></thead>';

                    var j = 1;
                    $.each(data.homeRetrieveList, function (i, item) {
                        var Status = "Not Completed";

                        if (item.status == 1) {
                            Status = "Submitted";
                        }
                        tab += '<tr class="success" ><td><input class="CheckBox" type="checkbox" /></td><td>' + item.employeeId + '</td><td>' + item.employeeName + '</td><td>' + item.subjectName + '</td><td>' + item.type + '</td><td>' + item.description + '</td><td>' + item.completionDate + '</td><td>' + item.submittedDate + '</td><td>' + Status + '</td></tr>';
                        j++;
                    });

                    $("#tableHeadings").append(tab);

                } else {
                    $("#tableHeadings").append('<h3 align="center">No Data</h3>');
                }
            }
        });
    }

    componentDidMount() {
        this.Request();
        window.scrollTo(0, 0);
        var self = this;
        $(document).ready(function () {

            // code to read selected table row cell data (values).
            $("#tableHeadings").on('click', '.CheckBox', function () {


                // get the current row
                var currentRow = $(this).closest("tr");
                self.state.employeeId = currentRow.find("td:eq(1)").text(); // get current row 3rd TD

                self.state.subjectName = currentRow.find("td:eq(3)").text(); // get current row 1st TD value
                self.state.type = currentRow.find("td:eq(4)").text(); // get current row 2nd TD
                self.state.description = currentRow.find("td:eq(5)").text();
                self.state.completionDate = currentRow.find("td:eq(6)").text();
                self.state.submittedDate = currentRow.find("td:eq(7)").text();

                self.state.status = currentRow.find(".SelectOption").val();
                var companyId = CryptoJS.AES.decrypt(localStorage.getItem('CompanyId'), "shinchanbaby").toString(CryptoJS.enc.Utf8)
                var reportingManagerId = CryptoJS.AES.decrypt(localStorage.getItem('EmployeeId'), "shinchanbaby").toString(CryptoJS.enc.Utf8)

                var checkbox = currentRow.find('input[type=checkbox]').is(":checked");

                self.state.companyId = companyId;
                // self.state.employeeId = employeeId
                self.setState({
                    submittedDate: self.state.submittedDate,
                    employeeId: self.state.employeeId,
                    companyId: self.state.companyId,
                    subjectName: self.state.subjectName,
                    type: self.state.type,

                    description: self.state.description,
                    completionDate: self.state.completionDate,
                    reportingManagerId: reportingManagerId
                })

                var json = JSON.stringify({
                    submittedDate: self.state.submittedDate,
                    employeeId: self.state.employeeId,
                    companyId: self.state.companyId,
                    subjectName: self.state.subjectName,
                    type: self.state.type,

                    description: self.state.description,
                    completionDate: self.state.completionDate,
                    reportingManagerId: reportingManagerId
                })
                if (checkbox == true) {
                    array.push(json);

                    console.log("array push", array);
                } else {
                    for (var k = 0; k < array.length; k++) {
                        if (array[k] == json) {

                            array.splice(k, 1)
                            console.log("array remove", array);
                        }
                    }
                }


            });
        });


    }




    completed() {
        var self = this;
        if (array.length > 0) {
            for (var k = 0; k < array.length; k++) {
                $.ajax({
                    type: 'POST',
                    data: array[k],
                    url: "https://wildfly.tictoks.com:443/EmployeeAttendenceAPI/HomeWork/HomeWorkCompleted",
                    contentType: "application/json",
                    dataType: 'json',
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        $("#tableHeadings").empty();

                    },


                    error: function (data) {

                        confirmAlert({
                            title: 'No Internet',                        // Title dialog
                            message: 'Network Connection Problem',               // Message dialog
                            confirmLabel: 'Ok',                           // Text button confirm
                        });

                    }


                });
                array = [];
            }
            confirmAlert({
                title: 'Success',                        // Title dialog
                message: 'Successfully Authorized Home Work',               // Message dialog
                confirmLabel: 'Ok',                           // Text button confirm
            });

            this.Request();
        } else {

            confirmAlert({
                title: 'Error',                        // Title dialog
                message: 'Please Select and Submit',               // Message dialog
                confirmLabel: 'Ok',                           // Text button confirm
            });

        }
    }

    reassign() {
        var self = this;
        if (array.length > 0) {
            for (var k = 0; k < array.length; k++) {
                $.ajax({
                    type: 'POST',
                    data: array[k],
                    url: "https://wildfly.tictoks.com:443/EmployeeAttendenceAPI/HomeWork/HomeWorkReassigned",
                    contentType: "application/json",
                    dataType: 'json',
                    async: false,
                    success: function (data, textStatus, jqXHR) {

                        $("#tableHeadings").empty();
                    },


                    error: function (data) {

                        confirmAlert({
                            title: 'No Internet',                        // Title dialog
                            message: 'Network Connection Problem',               // Message dialog
                            confirmLabel: 'Ok',                           // Text button confirm
                        });

                    }


                });
            }
            confirmAlert({
                title: 'Success',                        // Title dialog
                message: 'Successfully Reassigned  Home Work',               // Message dialog
                confirmLabel: 'Ok',                           // Text button confirm
            });
            array = [];
            this.Request();
        } else {

            confirmAlert({
                title: 'Error',                        // Title dialog
                message: 'Please Select and Submit',               // Message dialog
                confirmLabel: 'Ok',                           // Text button confirm
            });

        }
    }
   
    render() {
        return (


            <div className="container">


                <h3 className="centerAlign" style={{ textAlign: "center" }}>Evaluation</h3>
                <div id="tableOverflow">
                    <table class="table" id="tableHeadings" style={{ marginBottom: "2%" }}>
                    </table>
                </div>
                <div style={{

                    marginLeft: "auto",
                    marginRight: "auto",

                    marginBottom: "25px",
                    display: "block"
                }} >
                    <button
                    style={{

                        marginRight: "20px"}}

                        type="button"
                        className="btn btn-success"
                        onClick={() => this.completed()}
                    >Completed</button>
                    <button
                        type="button"

                        className="btn btn-success"
                        onClick={() => this.reassign()}
                    >Reassign</button>
                </div>

            </div>




        );
    }

}
export default HomeWorkEvaluationPage;