document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  
  document.querySelector('#compose-form').addEventListener('submit', post_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {


  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  show_mailbox(mailbox);
}

function post_email(event){
  event.preventDefault();
  let recipients = document.querySelector('#compose-recipients').value;
  let sub = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  // fetching data from the form and submitting it via POST req. to '/emails' so that 'compose' func. in viwes can grab it.
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: sub,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');

}

function show_mailbox(mailbox) {

  // location.reload(false);

  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {

    // ... do something else with emails ...
    
    const ul = document.createElement('ul');
    ul.className='list-group';
    emails.forEach(email => {
      clr=email.read?'read':'unread';
      const li = document.createElement('li');
        li.id=`${email.id}`;
        li.className=`list-group-item position-relative ${clr} my-1 border-top d-flex c-p`;
        li.innerHTML = `<h5 class="bold">${email.sender}</h5>
        <h6 class="mx-2 mt-1">${email.subject}</h6>
        <h6 class="position-absolute r-0 ">${email.timestamp} </h6></li>`;
        li.addEventListener('click', view_email);
      ul.append(li);
    });
    document.querySelector('#emails-view').append(ul);
});
}


function Reply(){

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch(`/emails/${this.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
  
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `\n\n------------------------------------------------------\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`;
  })

}


function Archive(){
    
  fetch(`/emails/${this.id}`)
  .then(response => response.json())
  .then(email => {
      val=!(email.archived)
      // flip the existing value of archive
      fetch(`/emails/${this.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: val
        })
      })

  load_mailbox('inbox');
})

}


function view_email() 
{
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';
  
  fetch(`/emails/${this.id}`)
  .then(response => response.json())
  .then(email => {

      // ... do something else with email ...
      // read ==> true
      fetch(`/emails/${this.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      
      // first empty the space
      document.querySelector('#view-email').innerHTML='';


      const div = document.createElement('div');
      div.className='container';
      div.innerHTML=`<span class="display-5 bold">From: </span><span class="display-5">${email.sender}</span><br>
      <span class="display-5 bold">To: </span><span class="display-5">${email.recipients}</span><br>
      <span class="display-5 bold">Subject: </span><span class="display-5">${email.subject}</span><br>
      <span class="display-5 bold">Timestamp: </span><span class="display-5">${email.timestamp}</span><br>`;

      const rpy = document.createElement('button');
      rpy.className='btn btn-sm btn-outline-primary mr-2 mt-3';
      rpy.id=`${email.id}`;
      rpy.addEventListener('click',Reply);
      rpy.innerHTML='Reply';
      div.append(rpy);

      ar=email.archived?'Unarchive':'Archive';
      const arh = document.createElement('button');
      arh.className='btn btn-sm btn-outline-success mx-2 mt-3';
      arh.id=`${email.id}`;
      arh.addEventListener('click',Archive);
      arh.innerHTML=ar;
      div.append(arh);

      const pre = document.createElement('pre');
      pre.innerHTML=`<hr>${email.body}`;
      div.append(pre);
      document.querySelector('#view-email').append(div);

  });
}