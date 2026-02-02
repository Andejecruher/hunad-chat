<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;

    public $email;

    public $role;

    public $password;

    public $verificationUrl;

    public function __construct($name, $email, $role, $password, $verificationUrl)
    {
        $this->name = $name;
        $this->email = $email;
        $this->role = $role;
        $this->password = $password;
        $this->verificationUrl = $verificationUrl;
    }

    public function build()
    {
        return $this->subject('Invitation to join '.config('app.name'))
            ->markdown('emails.user_invite')
            ->with([
                'name' => $this->name,
                'email' => $this->email,
                'role' => $this->role,
                'password' => $this->password,
                'verificationUrl' => $this->verificationUrl,
            ]);
    }
}
