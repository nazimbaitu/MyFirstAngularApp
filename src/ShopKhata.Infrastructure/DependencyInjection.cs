using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ShopKhata.Application.Abstractions;
using ShopKhata.Infrastructure.Authentication;
using ShopKhata.Infrastructure.Persistence;

namespace ShopKhata.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ShopKhata")
            ?? throw new InvalidOperationException("Connection string 'ShopKhata' is not configured.");
        services.AddDbContext<ShopKhataDbContext>(options => options.UseSqlServer(connectionString,
            sqlServer => sqlServer.MigrationsAssembly(typeof(ShopKhataDbContext).Assembly.FullName)));
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ShopKhataDbContext>());
        services.AddSingleton<ICredentialVerifier, Pbkdf2CredentialVerifier>();
        return services;
    }
}
