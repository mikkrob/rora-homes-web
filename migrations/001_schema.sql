-- RoRa Homes catalogue schema.
-- Prices are stored in cents. Images are stored as URLs (files live in static/images
-- now, later in object storage); Postgres keeps the URL and metadata.

create table rooms (
    id            text primary key,
    name          text not null,
    keep_options  text[] not null default '{}',   -- answers to "Mis peab kindlasti alles jääma?"
    sort          int not null default 0
);

create table products (
    id                  text primary key,          -- stable product code (SKU)
    name                text not null,
    category            text not null,
    kind                text not null,             -- how the drawn fallback illustration looks
    colors              text[] not null,           -- palette for the fallback illustration
    color_name          text not null,
    material            text not null,
    dims                text not null,
    price_cents         int not null check (price_cents >= 0),
    tags                text[] not null default '{}',
    is_demo             boolean not null default true,
    active              boolean not null default true,
    shopify_product_id  text unique,                -- set when the catalogue moves to Shopify
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create table product_images (
    id          bigint generated always as identity primary key,
    product_id  text not null references products(id) on delete cascade,
    role        text not null check (role in ('photo', 'cutout', 'variant')),
    url         text not null,
    width       int,
    height      int,
    alt         text not null default '',
    camera      text,                               -- for visualisation variants: eye / above / steep
    pose        text,                               -- for textiles: upright / leaning / lying ...
    sort        int not null default 0
);
create index product_images_product_idx on product_images (product_id);

create table product_alternatives (
    product_id      text not null references products(id) on delete cascade,
    alternative_id  text not null references products(id) on delete cascade,
    sort            int not null default 0,
    primary key (product_id, alternative_id),
    check (product_id <> alternative_id)
);

create table sets (
    id        text primary key,
    name      text not null,
    room_id   text not null references rooms(id),
    seasonal  boolean not null default false,
    moods     text[] not null default '{}',
    changes   text[] not null default '{}',
    summary   text not null,
    reason    text not null,
    active    boolean not null default true,
    sort      int not null default 0
);

-- Products in a set and where they sit on the room preview (percent of the image).
create table set_items (
    set_id      text not null references sets(id) on delete cascade,
    slot        text not null,
    product_id  text not null references products(id),
    kind        text not null,
    pos_x       numeric(6, 2) not null,
    pos_y       numeric(6, 2) not null,
    width       numeric(6, 2) not null check (width > 0),
    sort        int not null default 0,
    primary key (set_id, slot)
);

-- Pricing rule: discount rate by number of products removed from the set.
create table set_discounts (
    set_id         text not null references sets(id) on delete cascade,
    removed_count  int not null check (removed_count >= 0),
    rate           numeric(4, 3) not null check (rate >= 0 and rate < 1),
    primary key (set_id, removed_count)
);

-- Pre-defined variants of a set, e.g. the budget-friendly "lite" variant.
create table set_variants (
    set_id   text not null references sets(id) on delete cascade,
    code     text not null,
    note     text not null,
    swaps    jsonb not null default '{}',             -- {"slot": "product_id"}
    removes  text[] not null default '{}',            -- slots left out
    primary key (set_id, code)
);

create table set_images (
    id      bigint generated always as identity primary key,
    set_id  text not null references sets(id) on delete cascade,
    role    text not null check (role in ('hero', 'before', 'after', 'gallery')),
    url     text not null,
    alt     text not null default '',
    sort    int not null default 0
);

-- "Teata, kui pood avatakse" sign-ups.
create table signups (
    id          bigint generated always as identity primary key,
    email       text not null unique,
    consent     boolean not null check (consent),
    source      text,
    created_at  timestamptz not null default now()
);
