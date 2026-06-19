create table public.usuarios_cursos (
  id uuid default gen_random_uuid() primary key,
  matricula text not null unique,
  nombre text not null,
  apellidos text not null,
  correo text not null,
  rol text not null check (rol in ('Student', 'Teacher', 'External')),
  inscripcion_tda text not null default 'pendiente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Explicitly grant permissions to the roles that interact with the Data API
GRANT ALL ON TABLE public.usuarios_cursos TO anon;
GRANT ALL ON TABLE public.usuarios_cursos TO authenticated;
GRANT ALL ON TABLE public.usuarios_cursos TO service_role;
