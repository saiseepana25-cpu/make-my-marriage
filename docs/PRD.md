# Make My Marriage

Product Requirements Document — V1

| Version | 1.0 |
| --- | --- |
| Product | Make My Marriage |
| Initial Market | India |
| Primary Segment | Middle-class Indian weddings |
| Business Model | One-time payment per wedding |
| Platform | Responsive web application |
| Document Status | V1 Product Definition |

Everything your family needs to organize the wedding, together, in one place.

# 1. Executive Summary

Approved authentication milestone (2026-10-05): [AUTHENTICATION_DECISIONS.md](AUTHENTICATION_DECISIONS.md) specifies email/password, two-step signup saving wedding and OWNER together, immediate dashboard access, an 8-character password minimum, and 30-day sessions. Password recovery and email verification are deferred from this milestone; broader product requirements below are retained.

Make My Marriage is a web-based wedding planning and collaboration platform designed specifically for Indian weddings.

Indian weddings typically involve multiple ceremonies, large guest lists, several family members, many responsibilities, expenses, invitations, photos, and significant coordination.

Today, much of this planning happens through a combination of WhatsApp groups, spreadsheets, phone calls, notebooks, emails, and informal communication. This leads to fragmented information, unclear responsibilities, missed tasks, poor expense visibility, and repetitive communication.

Make My Marriage provides the bride, groom, and their families with one shared digital workspace where they can plan, organize, coordinate, experience, and preserve the wedding.

The V1 product will primarily focus on normal middle-class Indian weddings rather than luxury weddings, destination weddings, professional wedding planners, or wedding marketplaces.

## Wedding Workspace

Each wedding has one shared workspace containing:

- Dashboard

- Events

- Tasks

- Family members

- Guests

- Invitations

- RSVP

- Budget

- Expenses

- Wedding website

- Photo gallery

- Livestream links

- Notifications

- Activity history

- Post-wedding memories

The application should remain useful after the wedding by preserving important information such as events, expenses, guests, and photos.

# 2. Product Vision

## Vision

To become the digital operating system through which Indian families plan, coordinate, experience, and remember their weddings.

## Product Promise

Everything your family needs to organize the wedding, together, in one place.

# 3. Product Principles

## 3.1 Family-First

Indian weddings are often organized collectively. The product must therefore be designed around collaboration between:

- Bride

- Groom

- Parents

- Siblings

- Relatives

- Other trusted family members

## 3.2 Simple to Use

The application must be easy enough for users with different levels of technical comfort. Users should not need experience with project-management applications.

## 3.3 Mobile-Friendly

Although V1 is a web application, it must be fully responsive. Important mobile use cases include:

- Checking assigned tasks

- RSVP

- Viewing wedding events

- Opening venue information

- Uploading photos

- Viewing notifications

- Accessing the wedding website

## 3.4 Wedding-Specific

The product should not feel like a generic task-management system with wedding branding. Events, guests, families, expenses, ceremonies, photos, and wedding collaboration should feel native to the product.

## 3.5 Useful Before, During, and After the Wedding

### Before Wedding

- Planning

- Tasks

- Budgeting

- Guest management

- Invitations

- RSVP

### During Wedding

- Event details

- Family coordination

- Guest information

- Photo sharing

- Livestream access

### After Wedding

- Final expense summary

- Event history

- Guest records

- Photo gallery

- Wedding memories

# 4. Problem Statement

Planning an Indian wedding involves coordinating many different people, events, and responsibilities.

Common problems include:

- Tasks being communicated verbally or through messages

- Responsibilities being unclear

- Deadlines being missed

- Multiple ceremonies being managed independently

- Guest lists being maintained in spreadsheets

- Difficult RSVP tracking

- Expenses being paid by different family members

- Poor understanding of total wedding expenditure

- Wedding information being repeatedly shared manually

- Event schedules being scattered across messages

- Venue details being difficult for guests to locate

- Photos being spread across many phones and chat groups

- Wedding information becoming fragmented after the wedding

Make My Marriage solves these problems by centralizing wedding planning and collaboration.

# 5. Target Market

## Geography

V1 will initially target India. The product should reflect Indian wedding behaviors and workflows.

## Initial Customer Segment

The primary initial segment is middle-class Indian couples and families planning normal weddings.

The V1 product will not specifically target:

- Luxury weddings

- Celebrity weddings

- Large destination weddings

- Professional wedding planners

- Wedding agencies

These may be considered in future versions.

# 6. Primary Users

## 6.1 Bride and Groom

The bride and groom are the primary owners of the Wedding Workspace. They should be able to:

- Create the wedding

- Invite family members

- Create and manage events

- Create and assign tasks

- Manage guests

- Track RSVP

- Manage expenses

- Configure the wedding website

- Upload photos

- Configure livestream links

- Monitor overall wedding progress

## 6.2 Family Members

Family members may include parents, brothers, sisters, cousins, close relatives, and trusted participants. They should be able to:

- Access the Wedding Workspace

- View wedding information

- View assigned tasks

- Complete tasks

- Add relevant information

- Add expenses where permitted

- View guests

- Upload photos

- Participate in wedding coordination

## 6.3 Guests

Guests should not be required to create full Make My Marriage accounts. They primarily interact through the wedding website.

Guests should be able to:

- View wedding details

- View events

- View venue information

- RSVP

- View photos

- Upload photos

- Access livestream links

- View important wedding information

Guests must not have access to internal planning information.

# 7. Jobs to Be Done

## Bride / Groom

“When planning my wedding with my family, I want one place where I can see everything happening so that I know whether the wedding is under control.”

## Family Member

“When I am helping organize a wedding, I want to know what I am responsible for and when I need to complete it.”

## Couple Managing Budget

“When expenses are being paid by different people, I want to track everything centrally so that I understand the actual cost of the wedding.”

## Couple Managing Guests

“When inviting many guests, I want one guest list and RSVP system so that I know who is attending.”

## Guest

“When attending a wedding, I want one simple place to see the schedule, venue, RSVP, photos, and livestream information.”

## Couple After Wedding

“After the wedding, I want our important wedding information and photos to remain available as a digital record of the event.”

# 8. V1 Product Scope

The following modules are included in V1:

1.  Authentication

2.  Wedding onboarding

3.  Wedding Workspace

4.  Dashboard

5.  Event management

6.  Task management

7.  Family collaboration

8.  Activity feed

9.  Budget management

10.  Expense tracking

11.  Guest management

12.  Household guest grouping

13.  Invitations

14.  Email notifications

15.  RSVP

16.  Guest experience

17.  Wedding website

18.  Photo gallery

19.  Guest photo uploads

20.  Livestream links

21.  Notifications

22.  Search and filtering

23.  Documents and receipts

24.  Post-wedding mode

25.  Account settings

26.  Wedding settings

27.  One-time wedding package

# 9. Information Architecture

## Authenticated Wedding Workspace

- Dashboard

- Events

- Tasks

- Guests

- Budget

- Gallery

- Family

- Wedding Website

- Notifications

- Settings

### Events

- Event Details

- Related Tasks

- Related Expenses

- Event Photos

- Livestream

### Tasks

- All Tasks

- My Tasks

### Guests

- Households

- Individual Guests

- Invitations

- RSVP

### Budget

- Budget Overview

- Expenses

- Categories

### Gallery

- Albums

- Guest Uploads

### Family

- Members

- Activity

### Wedding Website

- Website Settings

- Content

- RSVP

- Gallery

- Livestream

## Guest-Facing Wedding Website

- Home

- Couple Information

- Our Story

- Events

- Venue

- RSVP

- Gallery

- Upload Photos

- Livestream

- Contact / Important Information

# 10. Functional Requirements

## FR-01: Authentication

The application must provide authentication for bride, groom, and family members.

Users should be able to:

- Create an account

- Log in

- Log out

- Reset forgotten password

- Manage profile information

### Authentication Method

The exact V1 authentication mechanism remains TBD.

Potential options include:

- Email and password

- Google sign-in

- Phone OTP

The final option should prioritize simplicity and low onboarding friction.

## FR-02: Wedding Creation and Onboarding

An authenticated user must be able to create a Wedding Workspace.

### Required Information

- Bride name

- Groom name

- Wedding date

- Primary wedding location

### Optional Information

- Couple photo

- Cover image

- Wedding description

- Couple story

- Contact information

After setup, users should enter the Wedding Dashboard.

## FR-03: Wedding Dashboard

The dashboard serves as the main command center.

It should display:

- Bride and groom names

- Wedding countdown

- Upcoming event

- Upcoming events

- Tasks due today

- Overdue tasks

- Task completion percentage

- Total guests

- RSVP summary

- Total wedding budget

- Total expenses

- Remaining budget

- Recent family activity

- Recent photo uploads

### Quick Actions

- Add task

- Add event

- Add expense

- Add guest

- Invite family member

- Upload photos

## FR-04: Event Management

Users must be able to create and manage multiple wedding events.

Examples include:

- Engagement

- Haldi

- Mehendi

- Sangeet

- Wedding

- Reception

- Custom event

### Event Fields

- Event name

- Description

- Date

- Start time

- End time

- Venue

- Location

- Map link

- Cover image

- Notes

- Status

### Event Actions

- Create event

- Edit event

- Delete event

- View event

- View upcoming events

- View past events

### Event Relationships

- Tasks

- Expenses

- Photos

- Livestream links

Event information should also be usable on the wedding website.

## FR-05: Task Management

Users must be able to manage wedding-related tasks.

### Task Fields

- Title

- Description

- Assigned family member

- Related event

- Due date

- Priority

- Status

- Notes

- Created by

- Created timestamp

### Statuses

- To Do

- In Progress

- Completed

### Priority Levels

- Low

- Medium

- High

### Task Actions

- Create task

- Edit task

- Delete task

- Assign task

- Reassign task

- Change status

- Mark completed

- Search tasks

- Filter tasks

### Views

- All Tasks

- My Tasks

### Filters

- Status

- Assignee

- Event

- Priority

- Due date

Tasks past their due date and not completed should automatically appear as overdue.

## FR-06: Family Collaboration

A wedding must support multiple family members within one shared workspace.

### Roles

Owner / Admin: typically bride and groom. Owners have full control over the Wedding Workspace.

Family Member: invited relatives or trusted participants who help with planning and execution.

Guest: guest-facing website access only.

### Admin Actions

- Invite family members

- View members

- Remove members

### Family Member Capabilities

- View wedding information

- View assigned tasks

- Update task progress

- Complete tasks

- Participate in wedding coordination

Complex permission management is outside V1.

## FR-07: Activity Feed

The application should record important activity within the Wedding Workspace.

Examples include:

- Rahul completed “Book Photographer”

- Bride created “Mehendi”

- Father added a ₹25,000 catering expense

- A household submitted RSVP

- New photos were uploaded

### Activity Fields

- User

- Activity type

- Related object

- Timestamp

Recent activity should appear on the dashboard.

## FR-08: Budget Management

Users must be able to define an overall wedding budget.

### Budget Functionality

- Set total budget

- Edit total budget

- View total spent

- View remaining budget

- View budget utilization percentage

- View category breakdown

- View event-wise spending

### Default Categories

- Venue

- Catering

- Decoration

- Photography

- Clothing

- Jewellery

- Makeup

- Entertainment

- Invitations

- Gifts

- Miscellaneous

Users should also be able to create custom categories.

## FR-09: Expense Tracking

The product must support detailed wedding expense tracking.

### Expense Fields

- Expense name

- Category

- Amount

- Related event

- Vendor/person

- Paid amount

- Remaining amount

- Payment status

- Paid by

- Payment date

- Notes

- Receipt attachment

### Payment Status

- Unpaid

- Partially Paid

- Paid

### Expense Actions

- Add expense

- Edit expense

- Delete expense

- Attach receipt

- Update payment status

- Search expenses

- Filter expenses

- View expense history

### Excluded

V1 will not process payments.

## FR-10: Guest Management

The product must provide a centralized wedding guest database. Guests should support both household-level organization and individual guest records.

## FR-11: Household Management

Indian wedding invitations are frequently organized by family or household.

### Household Fields

- Household/family name

- Primary contact

- Phone number

- Email

- Number invited

- Number attending

- RSVP status

- Notes

### Actions

- Create household

- Edit household

- Delete household

- Add guests to household

- View household members

## FR-12: Individual Guest Management

### Guest Fields

- Name

- Household

- Phone number

- Email address

- RSVP status

- Number attending where relevant

- Notes

### Actions

- Add guest

- Edit guest

- Delete guest

- Search guest

- Filter guest

- Associate guest with household

## FR-13: Invitations

V1 should support digital invitations.

### Invitation Experience

- Couple names

- Wedding date

- Basic wedding information

- Wedding website URL

- Website password/access information

- RSVP action

### Delivery

V1 should primarily support email-based invitations. WhatsApp integration is reserved for a later version.

## FR-14: Email Notifications

Email should support important external communication.

Potential emails include:

- Family member invitation

- Wedding guest invitation

- RSVP confirmation

- Wedding reminder

- Event reminder

- Task assignment notification

- Task due reminder

The final email delivery scope may be prioritized during implementation.

## FR-15: RSVP

Guests should be able to RSVP without creating a full account.

### RSVP Flow

Invitation → Wedding Website → RSVP → Confirmation

### RSVP Options

- Attending

- Not attending

The system should support:

- Household response

- Number attending

- Updating RSVP

- RSVP confirmation

- RSVP summary for wedding admins

## FR-16: Guest Experience

Guests should have a lightweight mobile-friendly experience.

Guests should be able to access:

- Wedding details

- Bride and groom information

- Events

- Venue

- Location/maps

- RSVP

- Gallery

- Photo upload

- Livestream

- Contact information

Guests must not see:

- Internal tasks

- Budget

- Expenses

- Internal activity

- Administrative settings

## FR-17: Wedding Website

Every wedding should have a guest-facing wedding website.

Example URL structure: makemymarriage.in/bride-and-groom. Exact routing implementation is an engineering decision.

### Website Access

The wedding website should support password protection.

### Website Sections

- Home — bride and groom names, cover photo, wedding date, countdown

- Our Story — couple introduction, story, photos

- Events — name, date, time, venue, location

- RSVP — submit or update attendance

- Gallery — view wedding photos

- Livestream — access event livestream links

- Contact / Important Information — important wedding details

## FR-18: Wedding Website Customization

V1 should intentionally keep customization limited.

Admins should be able to configure:

- Bride and groom names

- Cover image

- Couple photos

- Story

- Wedding details

- Basic theme

- Website password

A drag-and-drop website builder is outside V1.

## FR-19: Photo Gallery

The application should support wedding photo storage and viewing.

### Albums

Photos can be organized by event, such as Engagement, Haldi, Mehendi, Sangeet, Wedding, and Reception.

### Admin / Family Actions

- Upload photos

- View photos

- Organize photos

- Delete photos

- Download photos

## FR-20: Guest Photo Upload

Guests should be able to upload photos through the wedding website without a full Make My Marriage account.

Uploads may be associated with:

- Wedding

- Event

- Album

V1 will not require manual photo approval before display. Storage limits remain TBD.

## FR-21: Livestream

Make My Marriage will not provide native video-streaming infrastructure in V1.

Admins should instead be able to:

- Add livestream URL

- Edit livestream URL

- Remove livestream URL

- Associate livestream with event

Guests can access the livestream through the wedding website. External third-party streaming platforms may be used.

## FR-22: Notifications

The authenticated application should have an internal notification center.

Potential notifications include:

- Task assigned

- Task due

- Task completed

- New RSVP

- New event

- New photo uploads

- Important wedding activity

### Notification State

- Read

- Unread

## FR-23: Search and Filtering

Major product modules should support search and filtering.

Search/filtering should be supported for:

- Tasks

- Guests

- Expenses

- Events

- Family members

- Gallery/albums where useful

A sophisticated global search engine is not required in V1.

## FR-24: Documents and Receipts

Users should be able to attach files to relevant records.

Examples include:

- Expense receipts

- Bills

- Quotations

- Event documents

- Important wedding documents

This is a lightweight attachment feature. A complete document-management or vendor contract system is outside V1.

## FR-25: Post-Wedding Mode

The product must remain useful after the wedding date.

Before the wedding, the dashboard may display “32 Days to Go.” After the wedding, the product should transition toward an archival experience such as “Our Wedding.”

Users should continue to access:

- Events

- Final expenses

- Budget summary

- Guest information

- Wedding gallery

- Activity/history

- Wedding website

- Wedding memories

No data should automatically disappear simply because the wedding date has passed.

## FR-26: Account Settings

Users should be able to manage:

- Name

- Profile picture

- Email

- Password or authentication settings

## FR-27: Wedding Settings

Wedding owners should be able to manage:

- Bride name

- Groom name

- Wedding date

- Primary location

- Wedding image

- Website URL/slug

- Website password

- Family members

- Wedding status

## FR-28: One-Time Purchase

The intended business model is: One wedding → One-time payment.

V1 will not use a mandatory monthly subscription model. Exact pricing remains TBD.

Potential pricing decisions must consider:

- Storage allowance

- Email volume

- Photo usage

- Hosting costs

- Product support

- Duration of post-wedding access

# 11. Core User Flows

## Flow 1: Create Wedding

User signs up → Creates Wedding Workspace → Adds bride/groom details → Adds wedding date/location → Enters dashboard

## Flow 2: Invite Family Member

Admin opens Family → Selects Invite Member → Enters member information → Invitation sent → Member accepts invitation → Member joins Wedding Workspace

## Flow 3: Create and Assign Task

User selects Add Task → Adds title/details → Selects event → Assigns family member → Adds due date/priority → Saves task → Assignee receives notification

## Flow 4: Add Expense

User opens Budget → Adds expense → Selects category → Enters amount → Associates event if needed → Adds payment status → Uploads receipt if applicable → Budget totals update

## Flow 5: Add Guests

Admin opens Guests → Creates household if applicable → Adds guest details → Saves guests → Sends invitation later

## Flow 6: Guest RSVP

Guest receives invitation → Opens wedding website → Enters wedding password if required → Opens RSVP → Identifies invitation/household → Selects attendance → Confirms number attending → Submits response → Wedding dashboard updates

## Flow 7: Guest Photo Upload

Guest opens wedding website → Opens Gallery → Selects Upload Photos → Selects event/album → Chooses photos → Uploads → Photos become available in wedding gallery

## Flow 8: Livestream

Admin adds livestream link to event → Event appears on wedding website → Guest opens event/livestream section → Guest opens external or embedded livestream

# 12. Roles and Permissions

## Owner / Admin

Can manage:

- Wedding settings

- Events

- Tasks

- Family members

- Guests

- Budget

- Expenses

- Wedding website

- Photos

- Livestream links

## Family Member

Can participate in wedding planning. Detailed restrictions may be simplified in V1.

Typical access includes:

- View events

- View tasks

- Manage assigned tasks

- Participate in activity

- Upload photos

- Add planning information where allowed

## Guest

Guest-facing website access only.

Guests cannot access:

- Admin dashboard

- Internal tasks

- Budget

- Expenses

- Family management

- Internal settings

# 13. High-Level Data Model

## User

- User ID

- Name

- Email

- Authentication information

- Profile image

## Wedding

- Wedding ID

- Bride

- Groom

- Wedding date

- Location

- Cover image

- Website slug

- Password

- Status

## Wedding Member

- User

- Wedding

- Role

## Event

- Event ID

- Wedding

- Name

- Date

- Time

- Venue

- Description

- Status

## Task

- Task ID

- Wedding

- Event

- Assignee

- Created by

- Title

- Description

- Due date

- Priority

- Status

## Household

- Household ID

- Wedding

- Name

- Primary contact

- RSVP status

## Guest

- Guest ID

- Wedding

- Household

- Name

- Phone

- Email

- RSVP status

## Budget

- Wedding

- Total budget

## Expense

- Expense ID

- Wedding

- Event

- Category

- Amount

- Paid amount

- Status

- Paid by

- Receipt

## Photo

- Photo ID

- Wedding

- Event

- Album

- Uploaded by

- File reference

## Album

- Album ID

- Wedding

- Event

- Name

## Livestream

- Livestream ID

- Wedding

- Event

- URL

## Notification

- Notification ID

- User

- Wedding

- Type

- Read status

## Activity

- Activity ID

- Wedding

- User

- Action

- Related object

- Timestamp

# 14. Non-Functional Requirements

## 14.1 Responsive Design

The product must work across desktop, tablet, and mobile browser. Mobile usability is especially important.

## 14.2 Performance

Primary pages should load quickly under normal usage. Particular attention should be given to the Dashboard, Guest list, Photo gallery, and Wedding website.

## 14.3 Security

The application should implement appropriate security practices for authentication, password storage, wedding website passwords, uploaded files, user permissions, and sensitive expense information.

## 14.4 Privacy

Internal wedding planning information must not be visible to unauthorized guests. Wedding websites must support password protection.

## 14.5 Reliability

Core planning data should be stored reliably. Wedding information should not be lost due to ordinary application failures.

## 14.6 Scalability

Architecture should support weddings with potentially hundreds of guests, hundreds of tasks, many events, many expenses, and thousands of photos without requiring a redesign of the fundamental data model.

## 14.7 Accessibility

The interface should follow reasonable accessibility practices, including readable typography, good contrast, keyboard-friendly forms where practical, clear error states, and appropriate labels.

# 15. UX Requirements

The product should feel:

- Warm

- Celebratory

- Simple

- Trustworthy

- Collaborative

- Modern

The experience should avoid feeling:

- Corporate

- Complicated

- Like enterprise project management software

Important actions should generally be achievable with minimal navigation.

# 16. Success Metrics

Early success should be measured primarily through product adoption and usage rather than vanity metrics.

## Activation

- Percentage of users creating a wedding after signup

- Percentage adding first event

- Percentage adding first task

- Percentage inviting a family member

## Engagement

- Average active family members per wedding

- Tasks created per wedding

- Task completion rate

- Expenses entered per wedding

- Guests added per wedding

## Guest Engagement

- Invitation open rate

- RSVP completion rate

- Wedding website visits

- Photos uploaded by guests

## Retention

Because weddings are temporary projects, traditional long-term subscription retention is less meaningful.

- Percentage of weddings active across multiple weeks

- Percentage continuing usage through wedding day

- Percentage accessing gallery or archive after wedding

## Revenue

- Percentage of eligible weddings converting to paid package

- Revenue per wedding

- Cost to serve each wedding

# 17. V1 Acceptance Criteria

V1 should be considered functionally complete when a couple can perform the complete core journey:

1.  Create an account.

2.  Create their Wedding Workspace.

3.  Add multiple wedding events.

4.  Invite family members.

5.  Create and assign tasks.

6.  Track task completion.

7.  Set a wedding budget.

8.  Record expenses.

9.  Create households and guests.

10.  Send or share a digital invitation.

11.  Allow guests to RSVP.

12.  View RSVP totals.

13.  Publish a password-protected wedding website.

14.  Display event and venue information.

15.  Upload wedding photos.

16.  Allow guest photo uploads.

17.  Add livestream links.

18.  View internal notifications and activity.

19.  Continue accessing wedding information after the wedding.

If these flows work reliably across desktop and mobile browsers, the core V1 product is ready for release consideration.

# 18. Explicitly Out of Scope for V1

The following features are intentionally excluded from V1:

- WhatsApp integration

- Payment processing

- Vendor marketplace

- Full vendor management

- Hotel/accommodation management

- Guest transport management

- Wedding planner SaaS

- Multiple weddings per planner

- AI wedding assistant

- AI photo recognition

- Face recognition

- Granular financial permissions

- Physical invitation tracking

- Predefined wedding templates

- Native video streaming

- Advanced drag-and-drop wedding website builder

- Complex event-specific invitation rules

- Advanced photo moderation

- Full contract-management system

These features may be evaluated for future releases.

# 19. Future Opportunities

Potential V2 and later capabilities include:

- WhatsApp invitations and reminders

- Phone OTP authentication

- Payment tracking and transactions

- Vendor management

- Vendor marketplace

- Accommodation management

- Travel and pickup coordination

- AI wedding planning assistant

- Smart planning suggestions

- Budget recommendations

- Wedding templates

- Face-based photo discovery

- “Find My Photos”

- Advanced guest segmentation

- Role-based finance permissions

- Professional planner accounts

- Multi-wedding management

- Native mobile applications

None of these should delay V1 unless later prioritized explicitly.

# 20. Open Product Decisions

The following items still require final decisions before or during implementation:

## Authentication

Email/password, Google login, phone OTP, or a combination.

## Pricing

Exact one-time wedding package price.

## Storage

Photo and document storage allowance per wedding.

## Package Duration

Whether storage and wedding website access remain permanent or are subject to long-term archival rules.

## Email

Which email provider will be used and which notifications must be included at launch.

## Family Permissions

Exact actions family members can perform compared with admins.

## Website Themes

Number and type of basic wedding themes available in V1.

These decisions do not change the core product definition.

# 21. V1 Product Summary

Make My Marriage V1 is a collaborative wedding-management platform built around one central Wedding Workspace.

The product connects the major parts of an Indian wedding:

Events → Tasks → Family → Guests → RSVP → Budget → Expenses → Website → Photos → Memories

The primary differentiation is not any single feature. The value comes from combining these workflows into one simple family-centered system specifically designed for Indian weddings.

The V1 product should prioritize reliability, simplicity, collaboration, and mobile usability over feature quantity.

The product should allow a family to move from:

“We are planning a wedding.”

to:

“Everything about our wedding is organized here.”

and eventually:

“This is where our wedding memories live.”
