import { EmailErrorException } from '../exceptions/EmailException'
import * as nodemailer from 'nodemailer'
import { SendMailData } from '../interfaces/mail.interface'

const ACCOUNT = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const FRONT_END_URL = process.env.FE_BASE_URL

class EmailServices {
    private inviteFrom = {user: ACCOUNT, pass: PASSWORD};
    private transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: this.inviteFrom
    })

    public async sendingInviteMail(inviteTo: SendMailData) {
        try {
            await this.transporter.sendMail({
                from: this.inviteFrom.user,
                to: inviteTo.email,
                subject: "Invitation letter",
                html: `<h5>Dear ${inviteTo.fullName},</h5>
                <p>We are inviting you to create new account at <a href="${FRONT_END_URL}/inviting?token=${inviteTo.token}">This link</a></p>`
            })
        } catch (error) {
            throw new EmailErrorException(error.message)   
        }

    }

    public async sendingResetPasswordMail(inviteTo: SendMailData) {
        try {
            await this.transporter.sendMail({
                from: this.inviteFrom.user,
                to: inviteTo.email,
                subject: "Reset password",
                html: `<h5>Dear ${inviteTo.fullName},</h5>
                <p>We are sending you a link to reset password <a href="${FRONT_END_URL}/reset-password?token=${inviteTo.token}">LINK</a>. This will expire in 5 minutes.</p>`
            })
        } catch (error) {
            throw new EmailErrorException(error.message)   
        }

    }
}

export default EmailServices