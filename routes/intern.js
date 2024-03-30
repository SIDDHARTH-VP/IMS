var express = require('express');
var router = express.Router();
const checkAuth  = require('../auth/auth');
var multer = require('multer');
var database = require('../database');
const db = require('../config/db');
const Login = require('../models/login');
const Mentor = require('../models/mentor');
const Allocation = require('../models/allocation');
const Intern = require('../models/intern');
const WorkReport = require('../models/workreport');
const AssignWork = require('../models/assignwork');
const Work = require('../models/work');
const Course = require('../models/course')
const AllocatedCourse = require('../models/allocatedcourses');
const QueryandReply = require('../models/queryandreply');

var dt=Date.now();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/work');
  },
  filename: (req, file, cb) => {
    cb(null, dt + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
//intern

//Intern
router.get('/Internhome',checkAuth, function(req, res, next) {
    res.render('intern/home', { title: 'Register'});
  });
  
  router.get('/assignmentsubmission',checkAuth, function(req, res, next) {
    res.render('intern/assignmentsubmission', { title: 'Register'});
  });
  
  router.post('/assign_sub',checkAuth, async function(request, response, next){
    var assignment_title = request.body.textfield2;
    var  assignment_file = request.body.filefield;
    console.log(assignment_title);
    response.redirect("/assignmentsubmission");
  });
  
  router.get('/assignmentdetails/:assignedwork_id', checkAuth, async function(req, res, next) {
    const Intdat = await Intern.find({Inter_id:req.session.log_id});
    const alloc= await Allocation.find({intern_id:Intdat[0]._id});
    const assignwrk = await AssignWork.find({_id:req.params.assignedwork_id});
    var allocs=[];
    console.log(assignwrk +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
    for (const i of assignwrk) {
    
      const work = await Work.find({_id:i.work_id});

      const workreport = await WorkReport.find({assign_workid:req.params.assignedwork_id});

      try {
        allocs.push({'assign_date':work[0].assign_date,
      'workk_name':work[0].workk_name,
      'View':work[0].attach_file,
      'score':workreport[0].evaluation_score,
      'feedback':workreport[0].feedback,
      'description':work[0].work,'work':work[0].work,
      'submission_date':work[0].submission_date});
      } catch (error) {
        allocs.push({'assign_date':work[0].assign_date,
      'workk_name':work[0].workk_name,
      'View':work[0].attach_file,
      'score':'Not yet updated',
      'feedback':'Not yet updated',
      'description':work[0].work,'work':work[0].work,
      'submission_date':work[0].submission_date});
      }
      


  }

  // console.log(allocs);
    res.render('intern/assignmentdetails', { title: 'Register',mnn:allocs,'assignedwork_id':req.params.assignedwork_id});
  });
  
  router.post('/assigndetail',checkAuth, async function(request, response, next){

  
    response.redirect("/assignmentdetails");
  });


  router.post('/assignmentsubmission',upload.single('attachment'),checkAuth, async function(request, response, next){
    var work_content = request.body.answer;
    var attach_file= request.file.attachment;
    var file = '/uploads/work'+dt + '-' +request.file.originalname ;
    var sub_date = new Date().toISOString().split('T')[0];
    var item = {
      assign_workid: request.body.id ,
      submission_date: sub_date,
      attach_file : file,
      work_content: work_content,
      evaluation_score: "Pending",
      feedback: "Pending",
    }
    const submitQ = new WorkReport(item);
    const savedC = await submitQ.save();
    response.send("<script>alert('Assignment Submitted sucessfully');window.location='/assignmentdetails/"+request.body.id+"'</script>")
  });


  router.get('/internfeedback',checkAuth, function(req, res, next) {
    res.render('intern/internfeedback', { title: 'Register'})
  });
  router.post('/intfeed', async function(request, response, next){
    var Search = request.body.textfield;
    var Date = request.body.textfield;
    var Feedback = request.body.textfield;
    console.log(Search);
    response.redirect("/internfeedback");
  });
  
  
  router.get('/internprofileview',checkAuth,async function(req, res, next) {
      const docs = await Intern.find({ Inter_id :req.session.log_id, });
      res.render('intern/internprofileview', { title: 'Intern View', data: docs[0]});
    
   });
  
  
   router.get('/changepassword',async function(req, res, next) {
    i
  
    res.render('intern/changepassword', { title: 'Register'});
  });
  
  router.post('/changepassi',checkAuth, async function(request, response, next){
    const chngpass = await Login.find({_id:request.session.log_id,});
    var current_pass = request.body.textfield;
    var  new_pass = request.body.textfield2;
    var confrm = request.body.textfield3;
    if (new_pass==confrm)
  { var item = {
      password: new_pass,     
      }
  
    const changpass = await Login.find({_id:request.session.log_id}).findOneAndUpdate(item);
    const savedC = await changpass.save();
    response.send('<script>alert("Password changed sucessfully");window.location="/"</script>')
    // response.send('<script>alert("Invalid credentials"); window.location.href = "/"; </script>');
  
    //response.redirect("/changepassword");
  
    // response.redirect("/changepassword");
    }else{
      response.send('<script>alert("Password does not match");window.location="/changepassword"</script>')
    }
  
  });
  
  // router.post('/intprofview', async function(request, response, next){
  //   var Name = request.body.textfield;
  //   var Phone = request.body.textfield;
  //   var Email = request.body.textfield;
  //   var Address = request.body.textfield;
  //   var Qualifications = request.body.textfield;
  
  //   response.redirect("/internprofileview");
  // });
  
  router.get('/Internviewassignments', checkAuth, async function(req, res, next) {
    const Intdat = await Intern.find({Inter_id:req.session.log_id});
    const alloc= await Allocation.find({intern_id:Intdat[0]._id});
    const assignwrk = await AssignWork.find({intern_id:alloc[0].intern_id});
    var allocs=[];
  for (const i of assignwrk) {
    
      const work = await Work.find({_id:i.work_id});
      console.log(work[0]);
      allocs.push({'_id':i._id,'assign_date':work[0].assign_date,'workk_name':work[0].workk_name,'work':work[0].work,'submission_date':work[0].submission_date});
  }

  console.log(allocs);
    res.render('intern/Internviewassignments', { title: 'Register',mnn:allocs});
  });
  
  router.post('/intviewassign',checkAuth, async function(request, response, next){
    var Assignment_title = request.body.textfield;
    var Assigned_Date = request.body.textfield;
    var Sumbission_Date = request.body.textfield;
  
    response.redirect("/internviewassignments");
  });
  router.get('/queriesubmission', checkAuth, async function(req, res, next) {
    const Intdat = await Intern.find({Inter_id:req.session.log_id});
    const allocation = await Allocation.find({intern_id:Intdat[0]._id});
    const queryandreply = await QueryandReply.find({allocation_id:allocation[0]._id});
    

    res.render('intern/queriesubmission', { title: 'Register', mnn:queryandreply});
  });
  
  
  router.post('/q_sub',checkAuth, async function(request, response, next){
    var queries = request.body.textfield;
    const Intdat = await Intern.find({Inter_id:request.session.log_id});

  const allocation = await Allocation.find({intern_id:Intdat[0]._id});
    var item = {
      allocation_id: allocation[0]._id,
      query: queries,
      reply:'Not yet replied',
    

    };
    
    const submitQ = new QueryandReply(item);
    const savedC = await submitQ.save();
    // response.send(savedC);
  
    response.redirect("/queriesubmission");
  });
  
  
  router.get('/viewassignedcourses', checkAuth,async function(req, res, next) {
    const Intdat = await Intern.find({Inter_id:req.session.log_id});
    const Viewcourse = await AllocatedCourse.find({intern_id:Intdat[0]._id});
    var alloc=[];
  for (const i of Viewcourse) {
    try {

      const course = await Course.find({ _id: i.course_id });

      const mentorallocation = await Allocation.find({intern_id:Intdat[0]._id});
     var mentor = 'Not assigned';
      try {
        mentor = await Mentor.find({_id:mentorallocation[0].mentor_id})[0].Name;

      } catch (error) {
        mentor='Not  assigned';
      }
     
      alloc.push({
        'id':i._id,
        'Course_Name':course[0].course_name,
      'Duration': course[0].duration, 
      'Status': i.status,
      'Fees': course[0].fees,
      'Mentor_Assigned':mentor
    });
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  }
    res.render('intern/viewassignedcourses', { title: 'Register',mnn:alloc});
  });

  router.get('/viewassignedmentor', checkAuth, function(req, res, next) {
    res.render('intern/viewassignedmentor', { title: 'Register'});
  });

  

module.exports = router;
