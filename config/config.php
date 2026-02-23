<?php
/**
 * Config singleton: carga variables de entorno desde .env (si existe) y expone acceso centralizado.
 */
final class Config
{
    /** @var Config|null */
    private static $instance = null;
    /** @var bool */
    private $loaded = false;

    private function __construct()
    {
        $this->loadEnv();
    }

    /**
     * Inicializa phpdotenv y carga el archivo .env si existe.
     */
    private function loadEnv(): void
    {
        if ($this->loaded) {
            return;
        }

        $vendorAutoload = dirname(__DIR__) . '/vendor/autoload.php';
        if (file_exists($vendorAutoload)) {
            require_once $vendorAutoload;
        }

        if (class_exists('Dotenv\Dotenv')) {
            try {
                $dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
                // safeLoad evita excepciones si falta .env
                $dotenv->safeLoad();
            } catch (Throwable $e) {
                // Ignorar errores de carga, getenv/$_ENV pueden resolver
            }
        }

        $this->loaded = true;
    }

    /**
     * Obtiene la instancia singleton.
     */
    public static function getInstance(): Config
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Devuelve el valor de una variable de entorno.
     * Prioriza $_ENV y luego getenv(), devolviendo $default si no existe.
     */
    public function get(string $key, $default = null)
    {
        if (array_key_exists($key, $_ENV)) {
            return $_ENV[$key];
        }
        $val = getenv($key);
        return ($val !== false && $val !== null) ? $val : $default;
    }

    /**
     * Atajo estático para obtener una variable de entorno.
     */
    public static function env(string $key, $default = null)
    {
        return self::getInstance()->get($key, $default);
    }
}

// Helper global opcional si se desea una función env()
if (!function_exists('env')) {
    function env(string $key, $default = null) {
        return Config::env($key, $default);
    }
}
