create table users (
	id serial primary key,
	created_at timestamp default current_timestamp,
	name character varying(64)
);

create table companies (
	id serial primary key,
	created_at timestamp default current_timestamp,
	name character varying(64)
);

create table teams (
	id serial primary key,
	company_id integer references companies (id),
	user_id integer references users (id),
	contact_user boolean default false
);

create table listings (
	id serial primary key,
	created_at timestamp default current_timestamp,
	created_by integer references users (id),
	name character varying(64),
	description text
);

create table applications (
	id serial primary key,
	created_at timestamp default current_timestamp,
	user_id integer references users (id),
	listing_id integer references listings (id),
	cover_letter text
);
