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
const QueryandReply = require('../models/queryandreply');
const course = require('../models/course');
const AllocatedCourse = require('../models/allocatedcourses');

var dt=Date.now();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/work/');
  },
  filename: (req, file, cb) => {
    cb(null, dt + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
//mentor
router.get('/Mentorhome',checkAuth, function(req, res, next) {
  res.render('mentor/home', { title: 'Register'});
});


router.get('/Assignwork',checkAuth, async function(req, res, next) {
  const docs = await Mentor.find({ Mentor_id :req.session.log_id, });
  const allocint = await Allocation.find({mentor_id: docs[0]["_id"]});

  var alloc=[];
  for (const i of allocint) {
    try {

      const intern = await Intern.find({ _id: i.intern_id });
      const me = await Mentor.find({ _id: i.mentor_id });
      alloc.push({'intern_id':intern[0]._id,'Intern_Name':intern[0].Name,'Photo': intern[0].Photo});
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  }
  
  res.render('mentor/assignwork', { title: 'Register', inn: alloc});
});

router.post('/Assignwk_',upload.single('fileField'),checkAuth, async function(request, response, next){
  var work_title = request.body.textfield;
  var work1 = request.body.textarea;
  var attach_file= request.file.fileField;
  var file = '/uploads/work/'+dt + '-' +request.file.originalname ;
  var sub_date = request.body.textfield3;
  var intern_data =  request.body.Interns;
  var i;
  var Assign_date= new Date().toISOString().split('T')[0];
  var item = {
    mentor_id: request.session.log_id ,
    workk_name: work_title,
    attach_file : file,
    work:work1,
    assign_date: Assign_date,
    submission_date: sub_date ,
  }
  const Cors = new Work(item);
  const savedW = await Cors.save();
  if (Array.isArray(intern_data)) {
    intern_data =intern_data;
    for ( i of intern_data) {
    try {
      console.log(i);
      var assgnwk = {
        work_id: savedW._id ,
        intern_id: i,
        assign_date: Assign_date,
      }

      const AW = new AssignWork(assgnwk);
      const savedAW = await AW.save();
      // const intern = await Intern.find({ _id: i.intern_id });
      // const me = await Mentor.find({ _id: i.mentor_id });
    } catch (error) {
      console.log('Error fetching mentor [;poīñṭdk.lj,hugytfrdesdjkhgjyftdcv]:', error);
      
    }
  }

} else if (typeof(intern_data) === "string") {
  // intern_data = [intern_data];
  try {
    var assgnwk = {
      work_id: savedW._id ,
      intern_id: intern_data,
      assign_date: Assign_date,
      status : "Pending", 
    }
    const AW = new AssignWork(assgnwk);
    const savedAW = await AW.save();
    // const intern = await Intern.find({ _id: i.intern_id });
    // const me = await Mentor.find({ _id: i.mentor_id });
  } catch (error) {
    console.log('Error fetching mentor:', error);
    
  }
}
  // console.log(intern_data);

  response.redirect("/Assignwork");
  
  });



router.get('/evaluationandfeedback/:a_work',checkAuth,async function(req, res, next) {
  const Awork_data = await AssignWork.find({_id:req.params.a_work,});
  const work_data = await Work.find({_id:Awork_data[0]['work_id'],});

  var alloc =[];
  const workreport = await WorkReport.find({assign_workid:req.params.a_work,});
  console.log(workreport);
  atFile = 'No';
  if (workreport.length != 0){
    atFile=workreport[0].attach_file
  }
  alloc.push({'Work_Title':work_data[0].workk_name,'View':atFile,});

  console.log([alloc[0].View]);
  res.render('mentor/evalandfeedback', { title: 'Register',ef:alloc,'assignwork_id':req.params.a_work });
});
router.post('/evalandfback',checkAuth, async function(request, response, next){
  var assignwork_id= request.body.assignwork_id;
  var score = request.body.textfield;
  var feedback = request.body.textarea;
  console.log(score);
  console.log(feedback);

  var item = {
    
  evaluation_score: score,
  feedback: feedback,
  }
  
  const evalfeed = await WorkReport.find({assign_workid:assignwork_id}).findOneAndUpdate(item);
  const savedC = await evalfeed.save();



  const  data = await AssignWork.find({_id : assignwork_id})
  response.redirect("/viewassignedworkintern/"+data[0]["work_id"]);
});

router.get('/evaluatedresults',checkAuth,async function(req, res, next) {

  const mentdat = await Mentor.find({Mentor_id:req.session.log_id});
  const work = await Work.find({mentor_id:req.session.log_id});
  const assignwrk = await AssignWork.find({});

  var allocs=[];
  // console.log(work);
  for (const i of work) {
   for(const j of  assignwrk) {
    if(j.work_id == i._id ){
      //console.log("hello");
      const workreport = await WorkReport.find({assign_workid:j._id});
      const intern = await Intern.find({_id:j.intern_id});
      console.log(intern);
      try {
        allocs.push({
          'id':j._id,
        'workk_name':i.workk_name,
        'assign_date':i.assign_date,
        'View':i.attach_file,
        'score':workreport[0].evaluation_score,
        'feedback':workreport[0].feedback,
        'intern':intern[0].Name,
        'submission_date':i.submission_date,
        
      });
      } catch (error) {
      //   allocs.push({
      //     'assign_date':work[0].assign_date,
      //   'workk_name':i.workk_name,
      //   'View':i.attach_file,
      //   'score':'not yet updated',
      //   'feedback':'not yet updated',
      //   'intern':'not yet allocated',
      //   'submission_date':i.submission_date,
        
      // });
      }
      
    }
   }

}
// console.log(allocs +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
res.render('mentor/evaluatedresults', { title: 'Register', mnn: allocs});
});

//repeat of evaluvate

router.get('/evaluationandfeedback_evalresult/:a_work',checkAuth,async function(req, res, next) {
  const Awork_data = await AssignWork.find({_id:req.params.a_work,});
  const work_data = await Work.find({_id:Awork_data[0]['work_id'],});

  var alloc =[];
  const workreport = await WorkReport.find({assign_workid:req.params.a_work,});
  console.log(workreport);
  atFile = 'No';
  if (workreport.length != 0){
    atFile=workreport[0].attach_file
  }
  alloc.push({'Work_Title':work_data[0].workk_name,'View':atFile,});

  console.log([alloc[0].View]);
  res.render('mentor/evaluationandfeedback_evalresult', { title: 'Register',ef:alloc,'assignwork_id':req.params.a_work });
});
router.post('/evalandfback_evalresult',checkAuth, async function(request, response, next){
  var assignwork_id= request.body.assignwork_id;
  var score = request.body.textfield;
  var feedback = request.body.textarea;
  console.log(score);
  console.log(feedback);

  var item = {
    
  evaluation_score: score,
  feedback: feedback,
  }
  
  const evalfeed = await WorkReport.find({assign_workid:assignwork_id}).findOneAndUpdate(item);
  const savedC = await evalfeed.save();



  const  data = await AssignWork.find({_id : assignwork_id})
  response.redirect("/evaluatedresults");
});


router.get('/changepassword',checkAuth,async function(req, res, next) {
  

  res.render('mentor/changepassword', { title: 'Register'});
});

router.post('/changepassm',checkAuth, async function(request, response, next){
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


router.get('/internmonitoring',checkAuth,async function(req, res, next) {
  const docs = await Mentor.find({ Mentor_id :req.session.log_id, });
  const docs1 = await Allocation.find({mentor_id: docs[0]["_id"]});

  const docs3 = await Work.find({mentor_id: req.session.log_id});
  var intName=[];
  // console.log(docs3);
  for(const doc of docs3){
    try {


      const docs2 = await AssignWork.find({work_id: doc["_id"]});
      // console.log(docs2);
      for(const d of docs2)
      {
        try {
          const work= await  Work.find({_id:d["work_id"]});
          
          const indoc = await Intern.find({_id: d["intern_id"]});
          // console.log(indoc[0]);
          intName.push({'id':d['_id'],'Name':indoc[0]['Name'], 'work_title':doc['workk_name'],'status':d['status']});
          
        } catch (error) {
          // console.log(error);
        }
      }
      
    } catch (error) {
      console.log('');
      
    }
  }

  res.render('mentor/internmonitoring', { title: 'Register',mnn:intName});
});
router.post('/intermon', async function(request, response, next){
  // var search = request.body.textfield;
  var interns = request.body.checkbox2;
  // var work_assigned = request.body.textarea;  
 
  if (Array.isArray(interns)) {
   
    for ( i of interns) {
    try {
      // console.log(i);
      var assgnwk = {
        status: 'completed',
      }

      const AW = await AssignWork.find({_id:i}).findOneAndUpdate(assgnwk);
      // const intern = await Intern.find({ _id: i.intern_id });
      // const me = await Mentor.find({ _id: i.mentor_id });
    } catch (error) {
      console.log('Error fetching mentor [;poīñṭdk.lj,hugytfrdesdjkhgjyftdcv]:', error);
      
    }
  }
}

  response.redirect("/internmonitoring");
});


router.get('/MentorProfile',checkAuth,async function(req, res, next) {

  const docs = await Mentor.find({ Mentor_id :req.session.log_id, });

  res.render('mentor/mentorprofileview', { title: 'Ment_Prof',data:docs[0]});
});





router.post('/mentorpro', checkAuth,async function(request, response, next){
  var search = request.body.textfield;
  var name = request.body.textfield;
  var emp_id = request.body.textarea;  
  var dob = request.body.textarea;
  var address = request.body.textarea;
  var phone_no = request.body.textarea;
  var email = request.body.textarea;
  var qualifications = request.body.textarea;
  response.redirect("/MentorProfile");


});


router.get('/viewcoursealloc', checkAuth, function(req, res, next) {
  res.render('mentor/viewcoursealloc', { title: 'Register'});
});
router.post('/viewcorsalloc', async function(request, response, next){
  var interns = request.body.textfield;
  var course_allocated = request.body.textfield;
  var mentor_assigned = request.body.textarea; 

  response.redirect("/viewcoursealloc");
});



router.get('/replyquery', checkAuth, async function(req, res, next) {
  const Mntdat = await Mentor.find({Mentor_id:req.session.log_id});
  const allocation = await Allocation.find({mentor_id:Mntdat[0]._id});
  console.log(allocation[0]._id);
  const queryandreply = await QueryandReply.find({});
  console.log(queryandreply);
  var alloc=[];
  for (const i of queryandreply) {
    try {

  const allocationint = await Allocation.find({_id:i.allocation_id});
  const intern = await Intern.find({ _id: allocationint[0].intern_id });
      alloc.push({
        'id':i._id,
        'Intern_Name':intern[0].Name,
        'Photo': intern[0].Photo, 
        'Query': i.query,
         'Reply':i.reply,
         'date': i.date
        });
        
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  }
  res.render('mentor/replyquery', { title: 'Register', mnn:alloc});
});


router.post('/q_reply',checkAuth, async function(request, response, next){
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


router.get('/rep/:id', checkAuth, function(req, res, next) {
  req.session.complaint_id =  req.params.id;
  res.render('mentor/reply', { title: 'Register'});
});
router.post('/replypost', async function(request, response, next){
  
  var reply = request.body.textfield; 
  var item = {
    reply: reply,
   
  }
  const snrp = await QueryandReply.find({_id:request.session.complaint_id}).findOneAndUpdate(item);

  response.redirect("/replyquery");
});


router.get('/Mentorhome', checkAuth, function(req, res, next) {
  res.render('mentor/home', { title: 'Register'});
});



// tobesend
router.get('/mentor_viewassignedwork', checkAuth, async function(req, res, next) {
  var Data= await Work.find({ mentor_id :req.session.log_id, });
  
    
  res.render('mentor/viewassignedwork', { title: 'Register',mnn:Data});

});
router.post('/mentor_viewassignedwork_post', async function(request, response, next){
  
  var mentor_assigned = request.body.textarea; 

  response.redirect("/viewassignedwork");
});


router.get('/myassignedinterns',checkAuth,async function(req, res, next) {

  const mentdat = await Mentor.find({Mentor_id:req.session.log_id});
  const allocation = await Allocation.find({mentor_id:mentdat[0]._id});

  var allocs=[];
  // console.log(work);
  for (const i of allocation) {
      //console.log("hello");
      const intern = await Intern.find({_id:i.intern_id});
      console.log(intern);
      try {
        allocs.push({
          'id':intern[0]._id,
          'intern':intern[0].Name,
          'photo':intern[0].Photo,
        
      });
      } catch (error) {
        console.log(error);
    }

}
// console.log(allocs +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
res.render('mentor/myassignedinterns', { title: 'Register', mnn: allocs});
});


router.get('/generatereport/:Int_id',checkAuth,async function(req, res, next) {

  const mentdat = await Mentor.find({Mentor_id:req.session.log_id});
  const work = await Work.find({mentor_id:req.session.log_id});
  const assignwrk = await AssignWork.find({});
  const intern = await Intern.find({_id:req.params.Int_id});
  const allocatecourse = await AllocatedCourse.find({intern_id:req.params.Int_id});
  console.log(allocatecourse);
  const courses = await course.find({_id:allocatecourse[0].course_id});
  

  var allocs=[];
  // console.log(work);
  for (const i of work) {
   for(const j of  assignwrk) {
    if(j.work_id == i._id && j.intern_id== req.params.Int_id){
      //console.log("hello");
      const workreport = await WorkReport.find({assign_workid:j._id});
      console.log(intern);
      try {
        allocs.push({
          'id':j._id,
        'workk_name':i.workk_name,
        'assign_date':i.assign_date,
        'View':i.attach_file,
        'score':workreport[0].evaluation_score,
        'feedback':workreport[0].feedback,
        'intern':intern[0].Name,
        'submission_date':i.submission_date,
        
      });
      } catch (error) {   
      }
      
    }
   }

}


var totalScore = 0;
  var numAllocs = 0;
  
  for (const alloc of allocs) {
    totalScore += parseInt(alloc.score);
    numAllocs++;
  }
  
  var averageScore = totalScore / numAllocs;

console.log(totalScore +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
console.log(averageScore +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
res.render('mentor/generatereport', { title: 'Register', mnn: allocs,
    Int_id:req.params.Int_id, 
    intname:intern[0].Name,
    photo:intern[0].Photo,
    mentname:mentdat[0].Name,
    averageScore:averageScore,
    course:courses[0].course_name,
    Duration:courses[0].duration });
});

//repeat of generate report


router.post('/generatereportpost',checkAuth,async function(req, res, next) {

  var Int_id = req.body.Int_id;
  var fromdate = req.body.fromdate;
  var todate = req.body.todate;
  var Date = req.body.Date;

  const work = await Work.find({mentor_id:req.session.log_id});
  const assignwrk = await AssignWork.find({});
  const intern = await Intern.find({_id:Int_id});

  var allocs=[];
  // console.log(work);
  for (const i of work) {
   for(const j of  assignwrk) {
    if(j.work_id == i._id && j.intern_id== Int_id){
      //console.log("hello");
      const workreport = await WorkReport.find({assign_workid:j._id});
      try {
        if(i.assign_date >= fromdate && i.assign_date <= todate && Date == 'assign_date' ) {
        allocs.push({
          'id':j._id,
        'workk_name':i.workk_name,
        'assign_date':i.assign_date,
        'View':i.attach_file,
        'score':workreport[0].evaluation_score,
        'feedback':workreport[0].feedback,
        'intern':intern[0].Name,
        'submission_date':i.submission_date,
        
      });}
      if(i.assign_date >= fromdate && i.assign_date <= todate && Date == 'submission_date' ) {
        allocs.push({
          'id':j._id,
        'workk_name':i.workk_name,
        'assign_date':i.assign_date,
        'View':i.attach_file,
        'score':workreport[0].evaluation_score,
        'feedback':workreport[0].feedback,
        'intern':intern[0].Name,
        'submission_date':i.submission_date,
        
      });}
      } catch (error) {
      
      }
      
    }
   }

}
// console.log(allocs +' lkoijhgfbk,jmuyhfgtk,ljmuhygtfk,jmhg');
res.render('mentor/generatereport', { title: 'Register', mnn: allocs, Int_id:Int_id});
});


router.get('/viewassignedworkintern/:workid', async function(req, res, next) {
  const intern = await AssignWork.find({ work_id:req.params.workid});
  var alloc=[];
  for (const i of intern) {
    try {

      const intern = await Intern.find({ _id: i.intern_id });
      alloc.push({'id':i._id,'Intern_Name':intern[0].Name,'Photo': intern[0].Photo, 'Assigned_Date': i.assign_date});
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  }
  // console.log(intern);
  res.render('mentor/viewassignedintern', { title: 'Register', mnn: alloc});
});
router.post('/viewassignedintern', async function(request, response, next){
  
  var mentor_assigned = request.body.textarea; 

  response.redirect("/viewassignedintern");
});



router.get('/viewinternallocatedcourses', checkAuth, async function(req, res, next) {
  const intern = await CourseAlloc.find({ });
  var alloc=[];
  for (const i of intern) {
    try {

      const intern = await Intern.find({ _id: i.intern_id });
      const course = await Course.find({ _id: i.course_id });
      alloc.push({'id':i._id,'Intern_Name':intern[0].Name,'Photo': intern[0].Photo, 'Course_Name': course[0].course_name});
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  }
  console.log(intern);
  res.render('mentor/viewinternallocatedcourses', { title: 'Register', mnn: alloc});
});
router.post('/viewinternallocatedcourses', async function(request, response, next){
  
  var mentor_assigned = request.body.textarea; 

  response.redirect("/viewinternallocatedcourses");
});





  
module.exports = router;
