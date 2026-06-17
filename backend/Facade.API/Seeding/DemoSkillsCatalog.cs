namespace Facade.API.Seeding;

internal sealed record DemoSkillEntry(Guid Id, string Name, string? Description);

internal static class DemoSkillsCatalog
{
    internal static readonly DemoSkillEntry[] Skills =
    [
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567001"), "Java", "Java programming language"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567002"), "JavaScript", "JavaScript for web development"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567003"), "TypeScript", "Typed superset of JavaScript"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567004"), "React", "React UI library"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567005"), "Node.js", "JavaScript runtime for backend"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567006"), "Python", "Python programming language"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567007"), "C#", "C# and .NET development"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567008"), "SQL", "Structured query language"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567009"), "PostgreSQL", "PostgreSQL database"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567010"), "HTML", "HTML markup"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567011"), "CSS", "CSS styling"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567012"), "Git", "Version control with Git"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567013"), "Docker", "Containerization with Docker"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567014"), "AWS", "Amazon Web Services"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567015"), "Angular", "Angular framework"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567016"), "Vue.js", "Vue.js framework"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567017"), "Spring Boot", "Java Spring Boot framework"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567018"), "Kotlin", "Kotlin programming language"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567019"), "Go", "Go programming language"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567020"), "PHP", "PHP web development"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567021"), "ASP.NET Core", "ASP.NET Core web framework"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567022"), "REST API", "RESTful API design and development"),
        new(new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567023"), "Entity Framework Core", "EF Core ORM for .NET"),
    ];
}
